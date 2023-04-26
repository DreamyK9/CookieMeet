// This module contains abstractions for commonly used interactions with the Discord API
import { Message, ThreadAutoArchiveDuration } from "discord.js";

// create a thread from a command message
export async function commandThread(command: Message<boolean>, threadName: string) {
    const thread = await command.startThread({
        name: threadName,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
    });
    return thread;
}
