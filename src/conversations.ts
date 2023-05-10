// This module contains a set of classes to represent conversations between the bot and a user (in a thread)
// They are created by any command, that entails a process of multiple question/answer steps
import { generateUniqueId, log } from "./commons";
import {
  ChannelType,
  Guild,
  Message,
  ThreadChannel,
  User,
  VoiceBasedChannel,
} from "discord.js";
import DiscordEvent from "./events";
import { createConversationThread } from "./abstracts";

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
      this._thread = await createConversationThread(
        this._origin,
        "Event creation"
      );
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
      filter: (m) => m.author.id === this.user.id,
      max: 1,
      time: 3600 * 1000,
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
    const pattern = /^.{1,20}$/; // String with any 1 to 20 characters
    //! WARNING: This throws errors if the name is out of parameters!
    // TODO: Handle errors by catching them and sending an error message to the user TODO:fixt? testing needed!
    if (pattern.test(answer)){
      log("Received event name from user: " + answer.content);
      this._event.name = answer.content;
    } else {
      log("Das war keine gültige Eingabe versuche es nochmal");
      this._2_name();
    }

  }

  private async _3_startTime() {
    this.thread.send(`When should **${this._event.name}** take place?`);
    //! WARNING: This throws errors if the date is out of parameters! 
    // TODO: Handle errors by catching them and sending an error message to the user TODO:fixt? testing needed!
    const answer = await this.collectMessage();
    const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/; // parameters for YYY-MM-DD hh:mm  
    if (pattern.test(answer)){
      this._event.startDatetime = answer.content;
    } else {
      log("Das war kein gültiges Datenformat versuche es nochmal");
      this._3_startTime();
    }
  }

  private async _4_endTime() {
    this.thread.send(`When should **${this._event.name}** end?`);
    //! WARNING: This throws errors if the date is out of parameters!
    // TODO: Handle errors by catching them and sending an error message to the user  TODO:fixt? testing needed!
    const answer = await this.collectMessage();
    const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/; // parameters for YYY-MM-DD hh:mm  
    if (pattern.test(answer)){
      this._event.endDatetime = answer.content;
    } else {
      log("Das war kein gültiges Datenformat versuche es nochmal");
      this._4_endTime();
    }
  }

  private async _5_description() {
    this.thread.send(
      `Please provide a description for **${this._event.name}**`);
      //! WARNING: This throws errors if the description is out of parameters!
      // TODO: Handle errors by catching them and sending an error message to the user
    const answer = await this.collectMessage();
    const pattern = /^.{1,50}$/; 
    if (pattern.test(answer)){
      this._event.description = answer.content;
    } else {
      log("Das war keine gültige Beschreibung versuche es nochmal");
      this._5_description();
    }

  }

  private async _6_location() {
    this.thread.send(`Where should **${this._event.name}** take place?`);
    const answer = await this.collectMessage();
    const channels = (await this.guild.channels.fetch()).filter(
      (channel) => channel.name === answer.content
    );

    // Error handling
    if (channels.size === 0) {
      // TODO: Replace with user friendly error message
      throw new Error(
        `There is no channel called ${answer.content} on this server!`
      );
    }
    if (channels.size > 1) {
      // TODO: Replace with letting the user choose from a list of channels
      throw new Error(
        `There are multiple channels called ${answer.content} on this server!`
      );
    }
    channels.forEach((channel) => {
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
    this.thread.send(
      `Please confirm that the following information is correct:\n${this._event.print()}`
    );
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
