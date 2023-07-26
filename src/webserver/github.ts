import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { Client, EmbedBuilder } from 'discord.js';

const WEBHOOK_SECRET: string = process.env.GITHUB_SECRET!;

const githubMap = new Map<number, string>();

export const handleWebhook = (client: Client, req: Request, res: Response) => {
    // if (!verify_signature(req)) {
    //     res.status(401).send('Unauthorized');
    //     return;
    // }

    if (req.body.action === 'in_progress') {
        actionStart(client, req);
    }

    if (req.body.action === 'completed') {
        actionCompleted(client, req);
    }

    res.status(200).send('Webhook received successfully');
};

const actionStart = async (client: Client, req: Request) => {
    const workflow_run = req.body.workflow_run;
    const repository = req.body.repository;
    const organization = req.body.organization;
    const sender = req.body.sender;
    const unix_started_at = Math.floor(
        Date.parse(workflow_run.run_started_at) / 1000
    );

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${repository.name}/${workflow_run.head_branch}`,
            iconURL: organization.avatar_url,
            url: workflow_run.html_url,
        })
        .setDescription(
            `## Build <t:${unix_started_at}:R>
            Status: Build is running for **#${await getRunNumber(
                workflow_run.url
            )}** ${process.env.LOADING_EMOJI}
            Version: ${await getVersion(workflow_run.url)}
            `
        )
        .setFooter({
            text: sender.login,
            iconURL: sender.avatar_url,
        })
        .setColor('Blue');

    const channel = await client.channels.fetch(
        process.env.GITHUB_STATUS_CHANNEL!
    );
    if (!channel?.isTextBased()) return;
    channel.send({ embeds: [embed] }).then((message) => {
        githubMap.set(workflow_run.id, message.id);
    });
};

const actionCompleted = async (client: Client, req: Request) => {
    const workflow_run = req.body.workflow_run;
    const repository = req.body.repository;
    const organization = req.body.organization;
    const sender = req.body.sender;
    const unix_started_at = Math.floor(
        Date.parse(workflow_run.run_started_at) / 1000
    );
    const runTime =
        Date.parse(workflow_run.updated_at) -
        Date.parse(workflow_run.created_at);

    const channel = await client.channels.fetch(
        process.env.GITHUB_STATUS_CHANNEL!
    );
    if (!channel?.isTextBased()) return;
    if (!githubMap.has(workflow_run.id)) return;
    const oldMessage = await channel.messages.fetch(
        githubMap.get(workflow_run.id)!
    );

    const conclusion = workflow_run.conclusion === 'success' ? true : false;
    const status =
        workflow_run.conclusion === 'success'
            ? `${process.env.SUCCESS_EMOJI} Success`
            : `${process.env.FAIL_EMOJI} Failed`;
    const statusColor = workflow_run.conclusion === 'success' ? 'Green' : 'Red';

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${repository.name}/${workflow_run.head_branch}`,
            iconURL: organization.avatar_url,
            url: workflow_run.html_url,
        })
        .setDescription(
            `## Build <t:${unix_started_at}:R>
            Status: **${status} #${await getRunNumber(workflow_run.url)}**
            Version: ${await getVersion(workflow_run.url)}
            `
        )
        .setFooter({
            text: sender.login,
            iconURL: sender.avatar_url,
        })
        .setColor(statusColor);

    oldMessage.edit({ embeds: [embed] });
    githubMap.delete(workflow_run.id);
};

const getRunNumber = async (url: URL) => {
    const request = await fetch(url);
    const data = await request.json();
    return data.run_number;
};

const getVersion = async (apiurl: URL) => {
    const runDataRequest = await fetch(apiurl);
    const runData = await runDataRequest.json();

    const request = await fetch(
        `https://raw.githubusercontent.com/${runData.repository.full_name}/${runData.head_commit.id}/gradle.properties`
    );
    const data = await request.text();

    const lines = data.split('\n');
    const modVersionLine = lines.find((line) => line.startsWith('mod_version'));
    const minecraftVersionLine = lines.find((line) =>
        line.startsWith('minecraft_version')
    );
    if (modVersionLine && minecraftVersionLine) {
        const modVersion = modVersionLine.split('=')[1].trim();
        const minecraftVersion = minecraftVersionLine.split('=')[1].trim();
        return `${modVersion}-mc${minecraftVersion}.${await getRunNumber(
            apiurl
        )}`;
    } else {
        return "Couldn't find version";
    }
};

const verify_signature = (req: Request) => {
    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    return `sha256=${signature}` === req.headers['x-hub-signature-256'];
};
