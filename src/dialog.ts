interface DialogData {
    [key: string]: string[];
}
interface ErrorResponseData {
    [key: string]: string[][];
}

// ! WARNING: Untested Code!
export class DialogManager {
    private responses: DialogData;
    private errors: ErrorResponseData;

    constructor(responses: DialogData, errors: ErrorResponseData) {
        this.responses = responses;
        this.errors = errors;
    }

    getResponseAll(key: string): string[] {
        return this.responses[key];
    }
    getResponseRandom(key: string): string {
        const all = this.getResponseAll(key);
        return all[Math.floor(Math.random() * all.length)];
    }

    getErrorAll(key: string, level: number): string[] {
        return this.errors[level][key];
    }
    getRandomError(key: string, level: number): string {
        const all = this.getErrorAll(key, level);
        return all[Math.floor(Math.random() * all.length)];
    }
}
