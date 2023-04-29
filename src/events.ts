import * as E from "./errors/events";
import { NotImplementedError } from "./errors";
import { generateUniqueId } from "./commons";
import { VoiceBasedChannel } from "discord.js";
import { GuildMember } from "discord.js";

// A class to represent discord events
//! WARNING: The code in this file is partially untested and overall WIP!

export default class DiscordEvent {
    private _id: string;
    private _name: string;
    private _description: string;
    private _datetime: Date;
    private _channel: VoiceBasedChannel;
    private _participants: GuildMember[];
    private _creator: string;
    private _dateOfCreation: Date;
    private _timeIsSet: boolean;
    private _dateIsSet: boolean;

    constructor(creatorName: string) {
        this._id = generateUniqueId(10);
        this._creator = creatorName;
        this._datetime = new Date(0);
        this._dateIsSet = false;
        this._timeIsSet = false;
    }
    get id(): string {
        return this._id;
    }

    set name(value: string) {
        if (value.length > 100) {
            throw new E.EventNameTooLongError;
        }
        if (value.length < 2) {
            throw new E.EventNameTooShortError;
        }
        if (/[@#:,()<>[\]{}/|~&^\-/]/.test(value)) {
            throw new E.SpecialCharactersInEventNameError;
        }
        this._name = value.trim();
    }
    get name(): string {
        return this._name;
    }

    set description(value: string) {
        if (value.length > 1000) {
            throw new E.EventDescriptionTooLongError;
        }
        this._description = value.trim();
    }
    get description(): string {
        return this._description;
    }

    //* Date format: YYYY-MM-DD hh:mm:ss
    set datetime(value: string | Date) {
        if (typeof value == "string") {
            validateDateString(value);
        }
        const date = new Date(value);

        if (date.getTime() <= Date.now()) {
            throw new E.EventDatePastError;
        }
        this._datetime = date;
        this._dateIsSet = true;
        this._timeIsSet = true;
    }
    get datetime(): Date {
        return this._datetime;
    }

    set date(value: string | Date) {
        if (typeof value == "string") {
            validateDateString(value);
        }
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);

        // if the time is already set, check if the new date would lie in the past
        if (this._timeIsSet && date.getTime() + this.time.getTime() <= Date.now()) {
            throw new E.EventDatePastError;
        }

        this.datetime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        this._dateIsSet = true;
    }
    get date(): Date {
        const date = new Date(this._datetime);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    set time(value: string | Date) {
        if (typeof value == "string") {
            validateDateString(value);
        }
        const time = new Date(`1970 ${value}`);
        time.setFullYear(0, 0, 0);

        // if the date is already set, check if the new time would lie in the past
        if (this._dateIsSet && time.getTime() + this._datetime.getTime() <= Date.now()) {
            throw new E.EventDatePastError;
        }
        this._datetime.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
        this._timeIsSet = true;
    }
    get time(): Date {
        const time = new Date(this._datetime);
        time.setFullYear(0, 0, 0);
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
    set participants(value: GuildMember[]) {
        this._participants = value;
    }
    get participants(): GuildMember[] {
        return this._participants;
    }

    get creator(): string {
        return this._creator;
    }
    get dateOfCreation(): Date {
        return this._dateOfCreation;
    }

    public create() {
        this._dateOfCreation = new Date();
        throw new NotImplementedError("Event creation is not yet implemented!");
        // TODO: Call the discord API to create the event
    }
}

function validateDateString(date: string) {
    if (isNaN(Date.parse(`0 ${date}`))) {
        throw new E.EventDateFormatError;
    }
}
