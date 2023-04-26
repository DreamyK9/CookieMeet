// Errors having to do with the `Event` class

export class EventError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class EventNameError extends EventError {
    constructor(message: string) {
        super(message);
    }
}

export class EventNameTooLongError extends EventNameError {
    constructor() {
        super("An event name must be below 100 characters long!");
    }
}

export class EventNameTooShortError extends EventNameError {
    constructor() {
        super("An event name must be at least 2 characters long!");
    }
}

export class SpecialCharactersInEventNameError extends EventNameError {
    constructor() {
        super("An event name cannot contain any of the following characters: @#:,()<>[]{}|~&^\\-/");
    }
}

export class EventDescriptionTooLongError extends EventError {
    constructor() {
        super("An event description must be below 1000 characters long!");
    }
}

export class EventDateError extends EventError {
    constructor(message) {
        super(message);
    }
}

export class EventDateFormatError extends EventDateError {
    constructor() {
        super("The provided date is not formatted correctly!");
    }
}

export class EventDatePastError extends EventDateError {
    constructor() {
        super("The date of an event must lie in the future!");
    }
}
