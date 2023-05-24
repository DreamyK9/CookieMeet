// This module contains a set of classes to represent conversations between the bot and a user (in a thread)
// They are created by any command, that entails a process of multiple question/answer steps
import { ChannelType, Guild, Message, ThreadChannel, User, VoiceBasedChannel } from "discord.js";
import { generateUniqueId, log } from "./commons";
import DiscordEvent from "./events";
import { createConversationThread } from "./abstracts";
import * as EventErrors from "./errors/events";
//! WARNING: The code in this file is partially untested and overall WIP!
// TODO: thoruoghly test this class

export abstract class Conversation {
    private _id: string;
    private _guild: Guild;
    private _thread: ThreadChannel;
    private _origin: Message;
    private _user: User;
    private _published: boolean;

    constructor(message: Message) {
        this._id = generateUniqueId(10);
        this._guild = message.guild;
        this._user = message.author;
        this._origin = message;
        this._published = false;
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
        log("Starting conversation with user " + this.user.username);
        await this._1_greeting();
        await this._2_name();
        await this._3_startTime();
        await this._4_endTime();
        await this._5_description();
        await this._6_location();
        await this._7_participants();
        await this._8_confirmation();
        log("Test passed! Steps 4-7 executed without error!");
    }

    private _1_greeting() {
        this.thread.send("Welcome to the event creation experience!");
    }

    private async _2_name() {
        this.thread.send("What should I call your Event?");
        const answer = await this.collectMessage();

        //! WARNING: The error catch in this is only a template!
        // TODO: Finish error catching
        log("Received event name from user: " + answer.content);

        try {
            this._event.name = answer.content;
        } catch (error) {
            if (error instanceof EventErrors.EventNameTooLongError) {
                this.thread.send("The name you provided is too long! Please try again!");
                this._2_name();
            }
            if (error instanceof EventErrors.EventNameTooShortError) {
                this.thread.send("The name you provided is too short! Please try again!");
                this._2_name();
            }
            if (error instanceof EventErrors.SpecialCharactersInEventNameError){
                this.thread.send("An event name cannot contain any of the following characters: @#:,()<>[]{}|~&^\\-/");
                this._2_name();
            }
        }
    }

    private async _3_startTime() {
        this.thread.send(`When should **${this._event.name}** take place?`);
        const answer = await this.collectMessage();

        //! WARNING: This throws errors if the date is out of parameters!
        // TODO: Handle errors by catching them and sending an error message to the user
        try {
            this._event.startDatetime = answer.content;
        } catch (error) {
            if (error instanceof EventErrors.EventDateFormatError) {
                this.thread.send("The provided date/time is not formatted correctly!");
                this._3_startTime();
            }
            if (error instanceof EventErrors.EventDatePastError) {
                this.thread.send("The date/time is alrady passed!");
                this._3_startTime();
            }
        }
        
    }

    private async _4_endTime() {
        this.thread.send(`When should **${this._event.name}** end?`);
        const answer = await this.collectMessage();

        //! WARNING: This throws errors if the date is out of parameters!
        // TODO: Handle errors by catching them and sending an error message to the user
        try {
            this._event.endDatetime = answer.content;
        } catch (error) {
            if (error instanceof EventErrors.EventDateFormatError) {
                this.thread.send("The provided date/time is not formatted correctly!");
                this._4_endTime();
            }
            if (error instanceof EventErrors.EventDatePastError) {
                this.thread.send("The date/time is alrady passed!");
                this._4_endTime();
            }
            if (error instanceof EventErrors.EventEndsBeforeStartError){
                this.thread.send("The end date/time of an event must lie after the start date!");
                this._4_endTime();
            }
        }
    }

    private async _5_description() {
        this.thread.send(`Please provide a description for **${this._event.name}**`);
        const answer = await this.collectMessage();

        //! WARNING: This throws errors if the description is out of parameters!
        // TODO: Handle errors by catching them and sending an error message to the user
        try{
            this._event.description = answer.content;
        } catch (error) {
            if (error instanceof EventErrors.EventDescriptionTooLongError) {
                this.thread.send("The description you provided is too long! Please try again")
                this._5_description();
            }
        }
    }

    private async _6_location() {
        this.thread.send(`Where should **${this._event.name}** take place?`);
        const answer = await this.collectMessage();
        const channels = (await this.guild.channels.fetch()).filter(channel => channel.name === answer.content);

        // Error handling
        if (channels.size === 0) {
            // TODO: Replace with user friendly error message
            throw new Error(`There is no channel called ${answer.content} on this server!`);
        }
        if (channels.size > 1) {
            // TODO: Replace with letting the user choose from a list of channels
            throw new Error(`There are multiple channels called ${answer.content} on this server!`);
        }
        channels.forEach(channel => {
            if (channel.type !== ChannelType.GuildVoice) {
                // TODO: Replace with user friendly error message
                throw new Error("The provided channel is not a voice channel!");
            }
        });

        this._event.channel = channels.first() as VoiceBasedChannel;
    }

    private async _7_participants() {
        this.thread.send(`Who should participate in **${this._event.name}**?`);
        const answer = await this.collectMessage();
        const users = answer.mentions.users;

        if (users.size === 0) {
            throw new Error(`The mentioned users, if any are not on this server!`);
        }

        this._event.participants = Array.from(users.values());
    }

    private async _8_confirmation() {
        this.thread.send(`Please confirm that the following information is correct:\n${this._event.print()}`);
        const answer = await this.collectMessage();

        // TODO: Rework this AI-written mess
        if (answer.content.toLowerCase() === "yes") {
            this.thread.send("Great! I will now create the event!");
            this._event.create();
        } else {
            this.thread.send("Okay, I will cancel the event creation process!");
            this.thread.send("Closing this thread in 5 seconds...");
        }
    }
}
