// This module contains basic common functions used throughout the codebase
import { appendFile } from "fs";

// TODO: Bug: doesn't log all messages to the log file!
export function log(msg: string) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    const filename = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();

    appendFile(`data/logs/${filename}.log`, `[${timestamp}] ${msg}\n`, (err) => {if (err) throw err});
    console.log(`[${timestamp}] ${msg}`);
}
