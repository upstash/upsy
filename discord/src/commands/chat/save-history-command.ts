import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildBasedChannel,
    GuildTextBasedChannel,
    PermissionsString,
} from 'discord.js';

import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { addDocuments } from '../../llm/llm.js';

export class SaveHistoryCommand implements Command {
    public names = [Lang.getRef('chatCommands.savehistory', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let messages = [];

        // Create message pointer
        let message = await intr.channel.messages
            .fetch({ limit: 1 })
            .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

        while (message) {
            await intr.channel.messages
                .fetch({ limit: 100, before: message.id })
                .then(messagePage => {
                    messagePage.forEach(msg => {
                        let metadata = {
                            id: msg.id,
                            type: 'discord-channel-history',
                            author: msg.author.displayName,
                            guildId: msg.guildId,
                            channelId: msg.channelId,
                            content: msg.content,
                        };
                        messages.push({ id: msg.id, content: msg.content, metadata: metadata });
                    });

                    // Update our message pointer to be the last message on the page of messages
                    message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
                });
        }

        messages = messages.filter(msg => msg.content && msg.content.length > 0);

        addDocuments(messages);

        let embed = Lang.getEmbed('displayEmbeds.savehistory', data.lang, {});

        await InteractionUtils.send(intr, embed);
    }
}
