import { Command } from '../handlers/command.handler';
import { deleteWarningCommand } from './moderation/deletewarning.command';
import { listWarningsCommand } from './moderation/listwarnings.command';
import { warnCommand } from './moderation/warn.command';
import { sayCommand } from './util/say.command';
import { tagCommand } from './util/tag.command';

export const commands: Command[] = [
    sayCommand,
    tagCommand,
    warnCommand,
    listWarningsCommand,
    deleteWarningCommand,
];

export default commands;
