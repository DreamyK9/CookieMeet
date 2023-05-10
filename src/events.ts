import * as E from "./errors/events";
import { NotImplementedError } from "./errors";
import { generateUniqueId } from "./commons";
import {
  Guild,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  User,
  VoiceBasedChannel,
} from "discord.js";

// A class to represent discord events
//! WARNING: The code in this file is partially untested and overall WIP!

export default class DiscordEvent {
  private _id: string;
  private _guild: Guild;
  private _creator: string;
  private _dateOfCreation: Date;

  private _name: string;
  private _description: string;
  private _startDatetime: Date;
  private _endDatetime: Date;
  private _channel: VoiceBasedChannel;
  private _participants: User[];

  private _startTimeIsSet: boolean;
  private _startDateIsSet: boolean;
  private _endTimeIsSet: boolean;
  private _endDateIsSet: boolean;

  constructor(creatorName: string, guild: Guild) {
    this._id = generateUniqueId(10);
    this._creator = creatorName;
    this._guild = guild;
    this._startDatetime = new Date(0);
    this._endDatetime = new Date(0);
    this._startDateIsSet = false;
    this._startTimeIsSet = false;
  }
  get id(): string {
    return this._id;
  }

  set name(value: string) {
    value = value.trim();

    if (value.length > 100) {
      throw new E.EventNameTooLongError();
    }
    if (value.length < 2) {
      throw new E.EventNameTooShortError();
    }
    if (/[@#:,()<>[\]{}/|~&^\-/]/.test(value)) {
      throw new E.SpecialCharactersInEventNameError();
    }
    this._name = value;
  }
  get name(): string {
    return this._name;
  }

  set description(value: string) {
    if (value.length > 1000) {
      throw new E.EventDescriptionTooLongError();
    }
    this._description = value.trim();
  }
  get description(): string {
    return this._description;
  }

  // TODO: [Investigate] Dates might be passed/printed in the wrong timezone sometimes
  //* Date format: YYYY-MM-DD hh:mm:ss
  set startDatetime(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(value);
    }
    const datetime = new Date(value);

    if (datetime.getTime() <= Date.now()) {
      throw new E.EventDatePastError();
    }
    // if the end date/time is alredy set, check if the new start date would lie after the end date/time
    if (
      this._endDateIsSet &&
      this._endTimeIsSet &&
      datetime.getTime() >= this.endDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }
    this._startDatetime = datetime;
    this._startDateIsSet = true;
    this._startTimeIsSet = true;
  }
  get startDatetime(): Date {
    if (!(this._startDateIsSet && this._startTimeIsSet)) {
      throw new E.EventDateAccessError(
        "The start date/time of this event has not been set yet!"
      );
    }
    return this._startDatetime;
  }

  set startDate(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(value);
    }
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);

    // if the time is already set, check if the new date would lie in the past
    if (
      this._startTimeIsSet &&
      date.getTime() + this.startTime.getTime() <= Date.now()
    ) {
      throw new E.EventDatePastError();
    }
    // if the end date/time and start time are alredy set, check if the new start date/time would lie after the end date/time
    if (
      this._endDateIsSet &&
      this._endTimeIsSet &&
      this._startTimeIsSet &&
      date.getTime() >= this._endDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }

    this.startDatetime.setFullYear(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this._startDateIsSet = true;
  }
  get startDate(): Date {
    if (!this._startDateIsSet) {
      throw new E.EventDateAccessError(
        "The start date of this event has not been set yet!"
      );
    }
    const date = new Date(this._startDatetime);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  set startTime(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(`0 ${value}`);
    }
    const time = new Date(`1970 ${value}`);

    // if the date is already set, check if the new time would lie in the past
    if (
      this._startDateIsSet &&
      time.getTime() + this.startDatetime.getTime() <= Date.now()
    ) {
      throw new E.EventDatePastError();
    }
    // if the end date/time and start date are alredy set, check if the new start time would lie after the end date/time
    if (
      this._endDateIsSet &&
      this._endTimeIsSet &&
      this._startDateIsSet &&
      time.getTime() + this.startDate.getTime() >= this.endDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }
    this._startDatetime.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );
    this._startTimeIsSet = true;
  }
  get startTime(): Date {
    if (!this._startTimeIsSet) {
      throw new E.EventDateAccessError(
        "The start time of this event has not been set yet!"
      );
    }
    const time = new Date(this._startDatetime);
    time.setFullYear(1970, 1, 1);
    return time;
  }

  set endDatetime(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(value);
    }
    const datetime = new Date(value);

    // if the start date/time is alredy set, check if the new end date/time would lie before the start date/time
    if (
      this._startDateIsSet &&
      this._startTimeIsSet &&
      datetime.getTime() <= this.startDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }
    if (datetime.getTime() <= Date.now()) {
      throw new E.EventDatePastError();
    }

    this._endDatetime = datetime;
    this._endDateIsSet = true;
    this._endTimeIsSet = true;
  }
  get endDatetime(): Date {
    if (!(this._endDateIsSet && this._endTimeIsSet)) {
      throw new E.EventDateAccessError(
        "The end date/time of this event has not been set yet!"
      );
    }
    return this._endDatetime;
  }

  set endDate(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(value);
    }
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);

    // if the start date/time and end time are alredy set, check if the new end date would lie before the start date/time
    if (
      this._startDateIsSet &&
      this._startTimeIsSet &&
      this._endTimeIsSet &&
      date.getTime() + this.endTime.getTime() <= this.startDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }
    // if the time is already set, check if the new date would lie in the past
    if (
      this._endTimeIsSet &&
      date.getTime() + this.endTime.getTime() <= Date.now()
    ) {
      throw new E.EventDatePastError();
    }

    this.endDatetime.setFullYear(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this._endDateIsSet = true;
  }
  get endDate(): Date {
    if (!this._endDateIsSet) {
      throw new E.EventDateAccessError(
        "The end date of this event has not been set yet!"
      );
    }
    const date = new Date(this._endDatetime);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  set endTime(value: string | Date) {
    if (typeof value == "string") {
      validateDateString(`0 ${value}`);
    }
    const time = new Date(`1970 ${value}`);

    // if the start date/time and end time are alredy set, check if the new end date would lie before the start date/time
    if (
      this._startDateIsSet &&
      this._startTimeIsSet &&
      this._endDateIsSet &&
      time.getTime() + this.endDate.getTime() <= this.startDatetime.getTime()
    ) {
      throw new E.EventEndsBeforeStartError();
    }
    // if the date is already set, check if the new time would lie in the past
    if (
      this._endDateIsSet &&
      time.getTime() + this._endDatetime.getTime() <= Date.now()
    ) {
      throw new E.EventDatePastError();
    }

    this._endDatetime.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );
    this._endTimeIsSet = true;
  }
  get endTime(): Date {
    if (!this._endTimeIsSet) {
      throw new E.EventDateAccessError(
        "The end time of this event has not been set yet!"
      );
    }
    const time = new Date(this._endDatetime);
    time.setFullYear(1970, 1, 1);
    return time;
  }

  // TODO: implement channel validation somewhere else (in conversations?)
  set channel(value: VoiceBasedChannel) {
    this._channel = value;
  }
  get channel(): VoiceBasedChannel {
    return this._channel;
  }

  // TODO: implement participant validation somewhere else (in conversations?)
  set participants(value: User[]) {
    this._participants = value;
  }
  get participants(): User[] {
    return this._participants;
  }

  get creator(): string {
    return this._creator;
  }
  get dateOfCreation(): Date {
    return this._dateOfCreation;
  }

  public async create() {
    this._dateOfCreation = new Date();
    const event = await this._guild.scheduledEvents.create({
      name: this.name,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.Voice,
      scheduledStartTime: this._startDatetime,
      scheduledEndTime: this._endDatetime,
      description: this.description,
      channel: this.channel,
    });
    // TODO: invite participants to the event
  }

  public print() {
    /**
     * Returns an overview of the event's properties in a human-readable format
     * @returns {string} A string containing the event's properties
     */
    return `Event ID: ${this.id}
        Name: ${this.name}
        Description: ${this.description}
        Date: ${this.startDatetime}
        Channel: ${this.channel}
        Participants: ${this.participants
          .map((user) => `<@${user.id}>`)
          .join(", ")}
        `;
  }
}

function validateDateString(date: string) {
  if (isNaN(Date.parse(`${date}`))) {
    throw new E.EventDateFormatError();
  }
}
