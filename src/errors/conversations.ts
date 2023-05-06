class ConversationError extends Error {
    constructor(message) {
        super(message);
    }
}

class ConversationNotPublishedError extends ConversationError {
    constructor() {
        super("A conversation needs to be published, before it can be started!");
    }
}

class ConversationAlreadyPublishedError extends ConversationError {
    constructor() {
        super("A conversation can only be published once!");
    }
}
