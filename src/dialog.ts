interface DialogData {
    [key: string]: string[];
}

// ! WARNING: Untested Code!
class DialogManager {
    private responses: DialogData;
    private errors: DialogData;

    constructor(responses: DialogData, errors: DialogData) {
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

    getErrorAll(key: string): string[] {
        return this.errors[key];
    }
    getRandomError(key: string): string {
        const all = this.getErrorAll(key);
        return all[Math.floor(Math.random() * all.length)];
    }
}
