import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

export const sayCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  if (!interaction.guild || !interaction.channel) return;

  const content = interaction.options.getString('content', true);
  await interaction.deferReply({ ephemeral: true });
  interaction.channel.send(content);
  await interaction.editReply('I said what you said!');
};
