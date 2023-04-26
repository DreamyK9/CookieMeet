import * as e from "./errors/event";
// A class to represent discord events
//! WARNING: The code in this file is partially untested and overall WIP!

export default class DiscordEvent {
    private _id: string;
    private _name: string;
    private _description: string;
    private _datetime: Date;
    private _channel: string;
    private _participants: string;
    private _creator: string;

    constructor(creatorName: string) {
        this._id = generateUniqueId(10);
        this._creator = creatorName;
        this._datetime = new Date();
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
            throw new e.EventDescriptionTooLongError;
        }
        this._description = value.trim();
    }
    get description(): string {
        return this._description;
    }

    //* Date format: YYYY-MM-DD hh:mm:ss
    set datetime(value: string) {
        if (isNaN(Date.parse(value))) {
            throw new e.EventDateFormatError;
        }
        if (Date.parse(value) <= Date.now()) {
            throw new e.EventDatePastError;
        }

        this._datetime = new Date(value);
    }
    get datetime(): string {
        return this._datetime.toString();
    }
}


/* -------------------------- validation functions -------------------------- */
function validateEventName(name) {
    if (name.length > 100) {
        throw new e.EventNameTooLongError;
    }
    if (name.length < 2) {
        throw new e.EventNameTooShortError;
    }
    if (/[@#:,()<>[\]{}/|~&^\-/]/.test(name)) {
        throw new e.SpecialCharactersInEventNameError;
    }
}

/* ----------------------------- other functions ---------------------------- */

// TODO: export to file to save existing IDs between sessions
const existingIds: string[] = [];

// ! might need to export this function if it is used in other modules
function generateUniqueId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (result in existingIds) {
        result = generateUniqueId(length);
    }
    existingIds.push(result);
    return result;
}


/* ------------------------------ Event Errors ------------------------------ */
// TODO: export to own module (to prevent future circular dependencies)
