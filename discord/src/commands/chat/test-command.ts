import { ChatInputCommandInteraction, CommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class TestCommand implements Command {
    public names = [Lang.getRef('chatCommands.test', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        // get text after command
        // let response = await query('im', args.command, intr.channelId, intr.user.displayName, true);

        let embed = Lang.getEmbed('displayEmbeds.test', data.lang);

        embed.addFields([
            {
                name: 'Response',
                value: 'response',
            },
        ]);

        await InteractionUtils.send(intr, embed);
    }
}
