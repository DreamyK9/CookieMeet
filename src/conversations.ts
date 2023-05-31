// This module contains a set of classes to represent conversations between the bot and a user (in a thread)
// They are created by any command, that entails a process of multiple question/answer steps
import { ChannelType, Guild, Message, ThreadChannel, User, VoiceBasedChannel } from "discord.js";
import { createConversationThread } from "./abstracts";
import { generateUniqueId, log } from "./commons";
import DiscordEvent from "./events";
import * as EventErrors from "./errors/events";
import { ConversationAlreadyPublishedError, ConversationNotPublishedError } from "./errors/conversations";
import { eventCreationDialog } from "./dialog";

//! WARNING: The code in this file is partially untested and overall WIP!
// TODO: thoruoghly test this class

export abstract class Conversation {
    private _id: string;
    private _guild: Guild;
    private _thread: ThreadChannel;
    private _origin: Message;
    private _user: User;
    private _published: boolean;
    private _anger_level: number;

    constructor(message: Message) {
        this._id = generateUniqueId(10);
        this._guild = message.guild;
        this._user = message.author;
        this._origin = message;
        this._published = false;
        this._anger_level = 0;
    }

    get id(): string {
        return this._id;
    }
    get guild(): Guild {
        return this._guild;
    }
    get thread(): ThreadChannel {
        return this._thread;
    }
    get origin(): Message {
        return this._origin;
    }
    get user(): User {
        return this._user;
    }
    get published(): boolean {
        return this._published;
    }

    async publish(thread?: ThreadChannel) {
        if (this.published) {
            throw new ConversationAlreadyPublishedError();
        }

        if (thread) {
            this._thread = thread;
        } else {
        this._thread = await createConversationThread(this._origin, "Event creation");
        }
        this._published = true;
    }

    abstract start(): void;

    protected createCollector() {
    /**
     * Creates a message collector for this conversation
     * The collector will only collect messages, that were sent by the user, who started the conversation inside the conversations thread.
     * It only collects one message and will wait for 1 hour.
     * @returns said message collector
     */
        return this.thread.createMessageCollector({
            filter: m => m.author.id === this.user.id,
            max: 1,
            time: 3600 * 1000
        });
    }

    protected async collectMessage() {
    /**
     * Applies the message collector to the conversation and returns the collected message as promise (async)
     */
        const collector = this.createCollector();
        return new Promise<Message>((resolve, reject) => {
            collector.on("collect", resolve);
            collector.on("end", (collected, reason) => {
                if (reason === "time") {
                    reject("User did not respond in time!");
                }
            });
        });
    }

    protected async close() {
        this.thread.setArchived(true);
        this.thread.setLocked(true);
    }
}


export class EventConversation extends Conversation {
    private _event: DiscordEvent;

    constructor(message: Message) {
        super(message);
        this._event = new DiscordEvent(this.user.username, this.guild);
    }

    async start() {
        if (!this.published) {
            throw new ConversationNotPublishedError();
        }
        log("Starting event creation conversation with " + this.user.username);
        await this._1_greeting();
        await this._2_name();
        await this._3_startTime();
        await this._4_endTime();
        await this._5_description();
        await this._6_location();
        await this._7_participants();
        await this._8_confirmation();
    }

    private _1_greeting() {
        this.thread.send(eventCreationDialog.getResponseRandom("greeting"));
    }

    private async _2_name() {
        this.thread.send(eventCreationDialog.getResponseRandom("name"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();

            try {
                this._event.name = answer.content;
                break;
            } catch (error) {
                if (error instanceof EventErrors.EventNameTooLongError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventNameTooLong", 0));
                    continue;
                }
                if (error instanceof EventErrors.EventNameTooShortError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventNameTooShort", 0));
                    continue;
                }
                if (error instanceof EventErrors.SpecialCharactersInEventNameError){
                    this.thread.send(eventCreationDialog.getErrorRandom("SpecialCharactersInEventName", 0));
                    continue;
                }
            }
        }
    }

    private async _3_startTime() {
        this.thread.send(eventCreationDialog.getResponseRandom("start"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();

            try {
                this._event.startDatetime = answer.content;
                break;
            } catch (error) {
                if (error instanceof EventErrors.EventDateFormatError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventDateFormat", 0));
                    continue;
                }
                if (error instanceof EventErrors.EventDatePastError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventDatePast", 0));
                    continue;
                }
            }
        }
    }

    private async _4_endTime() {
        this.thread.send(eventCreationDialog.getResponseRandom("end"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();

            try {
                this._event.endDatetime = answer.content;
                break;
            } catch (error) {
                if (error instanceof EventErrors.EventDateFormatError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventDateFormat", 0));
                    continue;
                }
                if (error instanceof EventErrors.EventDatePastError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventDatePast", 0));
                    continue;
                }
                if (error instanceof EventErrors.EventEndsBeforeStartError){
                    this.thread.send(eventCreationDialog.getErrorRandom("EventEndsBeforeStart", 0));
                    continue;
                }
            }
        }
    }

    private async _5_description() {
        this.thread.send(eventCreationDialog.getResponseRandom("description"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();

            try {
                this._event.description = answer.content;
                break;
            } catch (error) {
                if (error instanceof EventErrors.EventDescriptionTooLongError) {
                    this.thread.send(eventCreationDialog.getErrorRandom("EventDescriptionTooLong", 0));
                    continue;
                }
            }
            break;
        }
    }

    private async _6_location() {
        this.thread.send(eventCreationDialog.getResponseRandom("location"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();
            const channels = (await this.guild.channels.fetch()).filter(channel => channel.name === answer.content);

            // Error handling
            if (channels.size === 0) {
                this.thread.send(eventCreationDialog.getErrorRandom("ChannelNotFound", 0))
                continue;
            }
            if (channels.size > 1) {
                this.thread.send(eventCreationDialog.getErrorRandom("MultipleChannelsFound", 0));
                continue;
            }
            for (const channel of channels.values()) {
                if (channel.type !== ChannelType.GuildVoice) {
                    this.thread.send(eventCreationDialog.getErrorRandom("ChannelNotVoiceBased", 0));
                    continue;
                }
            }

            this._event.channel = channels.first() as VoiceBasedChannel;
            break;
        }
    }

    private async _7_participants() {
        this.thread.send(eventCreationDialog.getResponseRandom("participants"));

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();
            const users = answer.mentions.users;

            if (users.size === 0) {
                this.thread.send(eventCreationDialog.getErrorRandom("UsersNotFound", 0));
                continue;
            }

            this._event.participants = Array.from(users.values());
            break;
        }
    }

    private async _8_confirmation() {
        this.thread.send(`Alles klar, das würde dann so aussehen:\n${this._event.print()}\nZufrieden damit?`);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const answer = await this.collectMessage();
            const userMsg = answer.content.toLowerCase();

            if (["yes", "y", "ja", "yo", "jap"].find(item => {return userMsg === item;})) {
                log(`Successfully created an event for ${this.user.username}`);
                this.thread.send("Ok, dann ist dein Event so gut wie erstellt. Viel spaß!");
                this._event.create();
                this.thread.setLocked(true, "event successfully created");
                this.thread.setArchived(true, "event successfully created");
                break;
            } else if (["no", "n", "nein", "nope", "ney"].find(item => {return userMsg === item;})) {
                // TODO: Give the option to edit the event
                log(`Conversation with user ${this.user.username} was canceled by the user`);
                this.thread.send("Na dann wird das nichts mehr.");
                this.thread.send("Ich breche den Kontakt ab!");
                this.thread.setLocked(true, "event creation canceled");
                this.thread.setArchived(true, "event creation canceled");
                break;
            } else {
                this.thread.send("Ich verstehe es nicht. Ist das ein ja oder ein nein?")
            }
        }
    }
}
