import { execSync } from 'child_process';
import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../handlers/command.handler';

export const updateCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update the bot')
        .setDMPermission(false),
    async execute(interaction) {
        if (interaction.user.id === process.env.OWNER_ID) {
            const embed = new EmbedBuilder()
                .setTitle('Update Failed')
                .setDescription('Already up to date')
                .setColor(Colors.Green);
            try {
                if (
                    !execSync('docker compose pull snrbot')
                        .toString()
                        .includes('snrbot Pulled')
                )
                    return interaction.reply('Already up to date');

                await interaction.reply({ embeds: [embed] });

                execSync(
                    'docker compose stop snrbot; docker compose up -d snrbot'
                );
            } catch (e) {
                console.error(e);
                const error = (e as Error)
                    .toString()
                    .replaceAll('`', '`' + '\u200B');
                interaction.reply(
                    `Failed to update: \`\`\`js\n${error}\`\`\` codeblock(String(e)`
                );
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('You are not allowed to use this command')
                .setColor(Colors.Red);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
