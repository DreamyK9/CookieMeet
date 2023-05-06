// This module contains basic common functions used throughout the codebase
import { appendFile } from "fs";

// BUG: doesn't log all messages to the log file!
export function log(msg: string) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const filename = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();

    appendFile(`logs/${filename}.log`, `[${timestamp}] ${msg}\n`, (err) => {if (err) throw err});
    console.log(`[${timestamp}] ${msg}`);
}


// TODO: outsource to file to save existing IDs between sessions
const existingIds: string[] = [];

// ! might need to export this function if it is used in other modules
export function generateUniqueId(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // check if the generated ID is already in use
    if (result in existingIds) {
        result = generateUniqueId(length);
    }

    existingIds.push(result);
    return result;
}
