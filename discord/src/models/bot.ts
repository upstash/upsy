import {
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Guild,
    Interaction,
    Message,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    RateLimitData,
    RESTEvents,
    User,
} from 'discord.js';
import { createRequire } from 'node:module';

import {
    ButtonHandler,
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
} from '../events/index.js';
import { addDocument, isQuestion, isWorthReaction, query } from '../llm/llm.js';
import { Logger } from '../services/index.js';
import { extractTextFromDocx, extractTextFromPDF } from '../utils/doc-utils.js';
import { PartialUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');
let Logs = require('../../lang/logs.json');

export class Bot {
    private ready = false;

    constructor(
        private token: string,
        private client: Client,
        private guildJoinHandler: GuildJoinHandler,
        private guildLeaveHandler: GuildLeaveHandler,
        private messageHandler: MessageHandler,
        private commandHandler: CommandHandler,
        private buttonHandler: ButtonHandler,
        private reactionHandler: ReactionHandler
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on(Events.ClientReady, () => this.onReady());
        this.client.on(Events.ShardReady, (shardId: number, unavailableGuilds: Set<string>) =>
            this.onShardReady(shardId, unavailableGuilds)
        );
        this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild));
        this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild));
        this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
        this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
        this.client.on(
            Events.MessageReactionAdd,
            (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
                this.onReaction(messageReaction, user)
        );
        this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
            this.onRateLimit(rateLimitData)
        );
    }

    private async login(token: string): Promise<void> {
        try {
            await this.client.login(token);
        } catch (error) {
            Logger.error(Logs.error.clientLogin, error);
            return;
        }
    }

    private async onReady(): Promise<void> {
        let userTag = this.client.user?.tag;
        Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag));

        this.ready = true;
        Logger.info(Logs.info.clientReady);
    }

    private onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
        Logger.setShardId(shardId);
        this.client.user.setActivity({
            name: 'upstash.com',
            state: 'Serverless Data Platform',
            url: 'https://upstash.com',
            type: 3,
        });
    }

    private async onGuildJoin(guild: Guild): Promise<void> {
        if (!this.ready || Debug.dummyMode.enabled) {
            return;
        }

        try {
            await this.guildJoinHandler.process(guild);
        } catch (error) {
            Logger.error(Logs.error.guildJoin, error);
        }
    }

    private async onGuildLeave(guild: Guild): Promise<void> {
        if (!this.ready || Debug.dummyMode.enabled) {
            return;
        }

        try {
            await this.guildLeaveHandler.process(guild);
        } catch (error) {
            Logger.error(Logs.error.guildLeave, error);
        }
    }

    private async onMessage(msg: Message): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(msg.author.id))
        ) {
            return;
        }

        try {
            msg = await PartialUtils.fillMessage(msg);
            if (!msg) {
                return;
            }

            let upsyMentioned =
                msg.content.toLowerCase().startsWith('upsy') ||
                msg.mentions.has(this.client.user) ||
                msg.guildId === null;

            if (msg.author.id !== this.client.user.id && !msg?.interaction?.commandName) {
                if (upsyMentioned) {
                    msg.react('🏃');

                    let resp = await query(
                        msg.guildId === null ? 'im' : 'channel',
                        msg.content,
                        msg.channel.id,
                        msg.author.username,
                        true
                    );

                    if (resp !== 'NONE') {
                        msg.reply(resp + `${msg.author}`).then(msg => {
                            msg.react('👍');
                            msg.react('👎');
                        });
                    } else {
                        msg.react('🤷🏻');
                    }
                }
            }

            if (
                msg.author.id !== this.client.user.id &&
                !upsyMentioned &&
                !msg?.interaction?.commandName
            ) {
                let reaction = await isWorthReaction(msg.content);
                if (reaction) {
                    msg.react(reaction);
                }
            }

            let question = false;

            if (
                msg.content &&
                msg.author.id !== this.client.user.id &&
                !msg?.interaction?.commandName
            ) {
                question = await isQuestion(msg.content);
                console.log('IS QUESTION: ', question);
            }

            if (!question && !msg?.interaction?.commandName) {
                //get attachments
                let attachment = msg.attachments.first();

                if (attachment) {
                    if (attachment.contentType === 'application/pdf') {
                        msg.content =
                            'Attachment Name: ' +
                            attachment.name +
                            ' Attachment Url:' +
                            attachment.url +
                            ' Attachment Description:' +
                            msg.content +
                            ', Attachment Upload Date: ' +
                            new Date().toLocaleDateString() +
                            ', Attachment Text: ' +
                            (await extractTextFromPDF(attachment));
                    } else if (
                        attachment.contentType ===
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ) {
                        msg.content =
                            'Attachment Name: ' +
                            attachment.name +
                            ', Attachment Url:' +
                            attachment.url +
                            ', Attachment Description:' +
                            msg.content +
                            ', Attachment Upload Date: ' +
                            new Date().toLocaleDateString() +
                            ', Attachment Text: ' +
                            (await extractTextFromDocx(attachment));
                    }
                }

                if (
                    msg.content &&
                    !msg?.interaction?.commandName &&
                    msg.author.id !== this.client.user.id
                ) {
                    msg.content += ', Date: ' + new Date().toLocaleDateString();
                    msg.content += ', Author: ' + msg.author.displayName;

                    let metadata = {
                        id: msg.id,
                        type: 'discord-message',
                        author: msg.author.displayName,
                        guildId: msg.guildId,
                        channelId: msg.channelId,
                        content: msg.content,
                        createdAt: new Date().toLocaleDateString(),
                    };

                    addDocument(metadata, msg.content);
                }
            }

            await this.messageHandler.process(msg);
        } catch (error) {
            Logger.error(Logs.error.message, error);
        }
    }

    private async onInteraction(intr: Interaction): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(intr.user.id))
        ) {
            return;
        }

        if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
            try {
                await this.commandHandler.process(intr);
            } catch (error) {
                Logger.error(Logs.error.command, error);
            }
        } else if (intr instanceof ButtonInteraction) {
            try {
                await this.buttonHandler.process(intr);
            } catch (error) {
                Logger.error(Logs.error.button, error);
            }
        }
    }

    private async onReaction(
        msgReaction: MessageReaction | PartialMessageReaction,
        reactor: User | PartialUser
    ): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(reactor.id))
        ) {
            return;
        }

        try {
            msgReaction = await PartialUtils.fillReaction(msgReaction);
            if (!msgReaction) {
                return;
            }

            reactor = await PartialUtils.fillUser(reactor);
            if (!reactor) {
                return;
            }

            if (
                reactor.id !== this.client.user.id &&
                msgReaction.message.author.id === this.client.user.id
            ) {
                if (msgReaction.emoji.name === '👍') {
                    msgReaction.message.reply(`Thank you for the feedback! ${reactor}`);
                } else if (msgReaction.emoji.name === '👎') {
                    msgReaction.message.reply(
                        `Sorry for not being helpful this time ${reactor}. Would you like to try a different question?`
                    );
                }
            }

            await this.reactionHandler.process(
                msgReaction,
                msgReaction.message as Message,
                reactor
            );
        } catch (error) {
            Logger.error(Logs.error.reaction, error);
        }
    }

    private async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
        if (rateLimitData.timeToReset >= Config.logging.rateLimit.minTimeout * 1000) {
            Logger.error(Logs.error.apiRateLimit, rateLimitData);
        }
    }
}
