import {
    Colors,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../handlers/command.handler';
import '../../utils/prisma';
import prisma from '../../utils/prisma';

export const listWarningsCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('list-warnings')
        .setDescription("List a user's warnings")
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('User to list warnings for')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.guild) return;

        const user = interaction.options.getUser('user', true);
        const member = await interaction.guild.members.fetch(user.id);

        try {
            const user = await prisma.user.findUnique({
                where: { id: member.id },
                include: { warnings: true },
            });

            if (user) {
                const embed = new EmbedBuilder()
                    .setTitle(`Warnings for ${member.user.username}`)
                    .setColor(Colors.Red)
                    .setTimestamp();
                user.warnings.forEach((warning) => {
                    embed.addFields({
                        name: `ID: ${warning.id}`,
                        value: `Reason: ${warning.reason}`,
                    });
                });
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content: `User ${member.user.username} has no warnings`,
                    ephemeral: true,
                });
            }
        } catch (error) {
            await interaction.reply({
                content: `Error fetching warnings for user ${member.user.username}`,
                ephemeral: true,
            });
        }
    },
};
