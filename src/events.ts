import * as E from "./errors/events";
import { NotImplementedError } from "./errors";
import { generateUniqueId } from "./commons";
// A class to represent discord events
//! WARNING: The code in this file is partially untested and overall WIP!

export default class DiscordEvent {
    private _id: string;
    private _name: string;
    private _description: string;
    private _datetime: Date;
    private _channel: string;
    private _participants: string[];
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
        validateEventName(value);
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

    set channel(value: string) {
        // TODO: validate channel
        throw new NotImplementedError("Channel validation not yet implemented!");
        this._channel = value.trim();
    }
    get channel(): string {
        throw new NotImplementedError("The channel property is not yet implemented!");
        return this._channel;
    }

    set participants(value: string[]) {
        // TODO: validate participants
        throw new NotImplementedError("Participant validation is not yet implemented!");
        this._participants = value;
    }
    get participants(): string[] {
        throw new NotImplementedError("The participants property is not yet implemented!");
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


/* -------------------------- validation functions -------------------------- */
function validateEventName(name) {
    if (name.length > 100) {
        throw new E.EventNameTooLongError;
    }
    if (name.length < 2) {
        throw new E.EventNameTooShortError;
    }
    if (/[@#:,()<>[\]{}/|~&^\-/]/.test(name)) {
        throw new E.SpecialCharactersInEventNameError;
    }
}

function validateDateString(date: string) {
    if (isNaN(Date.parse(`0 ${date}`))) {
        throw new E.EventDateFormatError;
    }
}
