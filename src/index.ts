// import the discord token from the .env file
import dotenv = require('dotenv');
dotenv.config();

// import stuff from the discord.js library
require('discord.js');
import { Client, GatewayIntentBits as Intent, Partials } from "discord.js";

// local imports
import { createConversationThread } from "./abstracts";
import { log } from "./commons";

log("Starting bot...");
const client = new Client({
    intents: [
        Intent.Guilds,
        Intent.GuildMessages,
        Intent.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.on("ready", () => {
    log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
    // only listen to messages in guild (server) channels
    // ! will prevent the bot from processing thread conversations
    // TODO: replace with case decision (either listen for commands or process thread)
    if (msg.thread) {
        log("Message was sent inside a thread! Ignoring...");
        return;
    } else if (msg.guild)
    switch(msg.content) {
        case ".create": {
            const thread = await createConversationThread(msg, "Event creation");

            thread.send("Welcome to the event creation experience!");
            log("Created thread!");
                thread.send("This thread will be archived and locked in 10s!");
            setTimeout(() => {
                thread.setArchived(true);
            }, 5000);
            break;
        }
        case ".list": {
            msg.reply("Sorry, the \"list\" command is not implemented yet!");
            break;
        }
        default: {
            msg.reply("If you want me to understand you, be so kind and speak more clearly!\nType \".help\" for a list of commands.");
        }
    }
});

// Setup is done! Let's login the bot!
client.login(process.env.DISCORD_TOKEN);

process.on("SIGINT", () => {
    log("User shutdown initiated. Exiting...");
    process.exit();
});
