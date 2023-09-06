const {
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
import * as ServerList from '../serverlist.json';

const AUTO_INTERVAL = Number(ServerList.AUTO_INTERVAL);
const MANUAL_COOLDOWN = Number(ServerList.MANUAL_COOLDOWN);
const server = ServerList.Server;

import { Handler, client } from '..';
import {
    APIActionRowComponent,
    APIActionRowComponentTypes,
    APIButtonComponent,
} from 'discord.js';

var lastCheck = new Date();

function httpGetAsync(url: string) {
    // If y'all can do better, go for it. This is just what i had
    return new Promise((resolve, reject) => {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                resolve(xmlHttp.responseText);
        };
        xmlHttp.open('GET', url, true);
        xmlHttp.send(null);
    });
}

async function update() {
    const serverAddressesChannel = client.channels.cache.get(
        process.env.ADDRESS_CHANNEL
    );
    lastCheck = new Date();
    if (!serverAddressesChannel?.isTextBased()) return;

    if (process.env.NODE_ENV == 'development') {
        console.log('Refreshing server statuses');
    }

    let embedFields = []; // Gather status info
    try {
        let status = await httpGetAsync(
            `https://api.mcsrvstat.us/2/${server.Address}` // This is the service I found to be the best.. There's another with more info, but requires a signin
        );
        status = JSON.parse(status);
        embedFields = {
            status: status.online,
            players: status.players.online,
            maxplayers: status.players.max,
        };
    } catch (e) {
        console.log(e);
    }

    let statusText = ``; // Start building the status text from status info
    if (server.Links) {
        statusText = statusText + `|`;
        for (const key in server.Links) {
            statusText = statusText + ` [${key}](${server.Links[key]}) |`;
        }
        statusText = statusText + '\n```ansi';
    }
    statusText =
        statusText +
        `\n(${
            embedFields.status
                ? '\u001b[1;34;4mONLINE'
                : '\u001b[1;31;4mOFFLINE'
        }\u001b[0;37m) - ${server.Address}`;

    if (embedFields.players) {
        if (embedFields.maxplayers) {
            statusText =
                statusText +
                `\n${embedFields.players}/${embedFields.maxplayers} Players online`;
        } else {
            statusText = statusText + `\n${embedFields.players} Players online`;
        }
    }

    const statusMessageEmbed = new EmbedBuilder() // Time to build the embed
        .setTitle('Server Status Checker')
        .setColor(`#000f74`)
        .setDescription(
            `Servers are auto-checked every ${AUTO_INTERVAL} seconds. Results can be manually refreshed every ${MANUAL_COOLDOWN} seconds.`
        )
        .setTimestamp();

    statusText = statusText + '```';
    console.log(statusText);
    statusMessageEmbed.addFields({
        name: server.Name,
        value: statusText,
        inline: false,
    });

    // Self explanitory - checking for exisiting message
    const existingMessage = (await serverAddressesChannel.messages.fetch()).first()

    if (existingMessage) {
        // If existing, replace embed.
        existingMessage.edit({ embeds: [statusMessageEmbed] });
    } else {
        const buttonRefresh = new ButtonBuilder() // ..else make new message
            .setStyle(ButtonStyle.Primary)
            .setLabel('Refresh')
            .setCustomId('Refresh_Button');

        const listButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('List Players')
            .setCustomId('List_Button');

        const listRow = new ActionRowBuilder().addComponents(
            buttonRefresh,
            listButton
        );

        serverAddressesChannel.send({
            embeds: [statusMessageEmbed],
            components: [listRow],
        });
    }
}

const serverCheckHandler: Handler = (client) => {
    setInterval(update.bind(client), AUTO_INTERVAL * 1000);

    client.on('interactionCreate', async (button) => {
        if (button.isButton()) {
            if (button.customId === 'Refresh_Button') {
                button.deferUpdate();
                if (
                    new Date().getTime() - lastCheck.getTime() >
                    MANUAL_COOLDOWN * 1000
                ) {
                    update();
                }
            } else if (button.customId === 'List_Button') {
                await button.deferReply({ ephemeral: true });
                try {
                    let status = await httpGetAsync(
                        `https://api.mcsrvstat.us/2/${server.Address}`
                    );
                    status = JSON.parse(status);
                    let listText = `There is ${status.players.online} player(s) online:`;
                    listText = listText + '\n```';
                    status.players.list.forEach((player: string) => {
                        listText = listText + `\n${player}`;
                    });
                    listText = listText + '\n```';
                    button.editReply(listText)
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });
};

export default serverCheckHandler;
