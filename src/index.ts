import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import { reuploadCommands } from './_reupload';

import { parseLog } from './logs';

import { tagsCommand } from './commands/tags';
import { sayCommand } from './commands/say';

import { green, bold, yellow } from 'kleur/colors';
import 'dotenv/config';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Channel],
});

client.once('ready', async () => {
  console.log(green('Discord bot ready!'));

  if (process.env.LOGS_CHANNEL) {
    const logsChannel = await client.channels.fetch(process.env.LOGS_CHANNEL);

    if (!logsChannel?.isTextBased()) return;

    await logsChannel.send({ content: 'Bot is ready! :D' });
  }

  if (process.env.NODE_ENV !== 'development')
    console.warn(yellow(bold('Running in production mode!')));

  client.user?.presence.set({
    activities: [{ name: `Steam 'n' Rails` }],
    status: 'online',
  });

  client.on(Events.MessageCreate, async (e) => {
    try {
      if (e.channel.partial) await e.channel.fetch();
      if (e.author.partial) await e.author.fetch();

      if (!e.content) return;
      if (!e.channel.isTextBased()) return;

      if (e.author === client.user) return;

      const log = await parseLog(e.content);
      if (log != null) {
        e.reply({ embeds: [log] });
        return;
      }
    } catch (error) {
      console.error('Unhandled exception on MessageCreate', error);
    }
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
      await interaction.reply({
        content: `Pong! \`${client.ws.ping}ms\``,
        ephemeral: true,
      });
    } else if (commandName === 'say') {
      await sayCommand(interaction);
    } else if (commandName === 'tag') {
      await tagsCommand(interaction);
    }
  } catch (error) {
    console.error('Unhandled exception on InteractionCreate', error);
  }
});

reuploadCommands()
  .then(() => {
    client.login(process.env.DISCORD_TOKEN);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
