import {
  SlashCommandBuilder,
  Routes,
  PermissionFlagsBits,
  type RESTGetAPIOAuth2CurrentApplicationResult,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { getTags } from './tags';

export const reuploadCommands = async () => {
  const tags = await getTags();

  const commands = [
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with pong!'),
    new SlashCommandBuilder()
      .setName('tag')
      .setDescription('Send a tag')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('The tag name')
          .setRequired(true)
          .addChoices(...tags.map((b) => ({ name: b.name, value: b.name })))
      )
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('The user to mention')
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName('say')
      .setDescription('Say something through the bot')
      .addStringOption((option) =>
        option
          .setName('content')
          .setDescription('Just content?')
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .setDMPermission(false),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  const { id: appId } = (await rest.get(
    Routes.oauth2CurrentApplication()
  )) as RESTGetAPIOAuth2CurrentApplicationResult;

  await rest.put(Routes.applicationCommands(appId), {
    body: commands,
  });

  console.log('Successfully registered application commands.');
};
