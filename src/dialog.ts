
// ! WARNING: Untested Code!
export class DialogManager {
    private responses: Record<string, string[]>;
    private errors: Record<string, string[][]>;
    private angerLevel: object;

    constructor(responses: Record<string, string[]>, errors: Record<string, string[][]>) {
        this.responses = responses;
        this.errors = errors;
        this.angerLevel = [];
    }

    getResponseAll(key: string): string[] {
        return this.responses[key];
    }
    getResponseRandom(key: string): string {
        const all = this.getResponseAll(key);
        return all[Math.floor(Math.random() * all.length)];
    }

    getErrorAll(key: string, level: number): string[] {
        return this.errors[key][level];
    }
    getErrorRandom(key: string, level: number): string {
        const all = this.getErrorAll(key, level);
        return all[Math.floor(Math.random() * all.length)];
    }
}

export const eventCreationDialog = new DialogManager({
    "greeting": [
        "Du willst also ein Event erstellen... Na dann leg mal los!",
        "Ein Event? Kein Problem! Fangen wir an!",
        "Ein Event soll's also sein? Dann  los!",
    ],
    "name": [
        "Wie soll dein Event denn heißen?",
        "Wie soll ich dein Event nennen?",
        "Name bitte!",
    ],
    "start": [
        "Interessanter Name... Wann soll's losgehen?",
        "Wann geht's denn los?",
    ],
    "end": [
        "Und wann soll's wieder vorbei sein?",
        "Und wann ist Schluss?",
    ],
    "description": [
        "Dann beschreibe dein Event doch mal kurz!",
        "Wie würdest du dein Event beschreiben?",
        "Beschreibe dein Event!",
        "Was soll ich denn in die Beschreibung packen?",
    ],
    "location": [
        "So, jetzt noch der Kanal, wo das Event stattfinden soll!",
        "Und wo soll das Event stattfinden?",
        "Dann bräuchte ich noch den Kanal, wo das Event stattfinden soll!",
        "In welchem Kanal soll das Event stattfinden?"
    ],
    "participants": [
        "Und zu guter Letzt: Wen darf ich alles einladen?",
        "Und wer darf alles eingeladen werden?",
        "Soll ich noch wen einladen? Dann rede jetzt oder schweig für immer!",
    ],
    "confirmation": [
        "Alles klar, das würde dann so aussehen:\n{}\nZufrieden damit?",
        "Wenn ich das richtig verstanden habe, sieht das so aus:\n{}\nPasst das so?",
    ],
},
{
    "EventNameTooLong": [
        [
            "Bist du dir da wirklich sicher? Denn der Name ist mit Sicherheit zu lang! Versuch mal was unter 100 Zeichen",
            "Kein Name sollte jemals so lang sein! Bitte versuch es mit unter 100 Zeichen!"
        ],
        [
            "Ist das dein Ernst..? *unter* 100 Zeichen!",
            "Du musst wohl eine Leseschwäche haben, denn ich sagte *unter* 100 Zeichen!",
        ],
        [
            "Ich sage das ein letztes Mal! Nimm einen Namen unter 100 Zeichen! >:(",
            "Noch ein Mal und ich schmeiß dich raus! Nimm gefälligst Namen unter 100 Zeichen! >:(",
            "Bist du nur so dämlich?! Weniger. Als. 100. Zeichen. *Letzte Warnung!* >:(",
        ]
    ],
    "EventNameTooShort": [
        [
            "Das ist ja mal ein kurzer Name... Versuch's doch mal mit mehr als einem Zeichen!",
            "1 Zeichen ist ein bisschen kurz, findest du nicht? Mach mal mindestens 2 draus!",
        ],
        [
            "Ich verstehe schon, du willst es kurz und knackig... Aber ich brauche nunmal mehr als 1 Zeichen!",
            "Komm schon! Du hast mich ja wohl verstanden! 2 Zeichen oder hieraus wird nix!",
        ],
        [
            "Letzte Warnung! Ich brauche mindestens 2 Zeichen! Sonst verbanne ich dich auf die Troll-Insel!",
            "Ich habe es satt, mich mit dir rumzuschlagen! 2 Zeichen oder du fliegst raus!",
        ]
    ],
    "SpecialCharactersInEventName": [
        [
            "Bitte keine Sonderzeichen im Namen! Das macht Wumpus wütend!",
            "Sorry, aber Sonderzeichen gehen nicht! Versuch es nochmal!",
        ],
        [
            "Zahlen, Buchstaben, Punkte, Leerzeichen und Unterstriche. Sonst nix! Capiche?",
            "Komm schon, Zahlen, Buchstaben, Punkte, Leerzeichen und Unterstriche sind ja wohl genug Auswahl!",
        ],
        [
            "Ich habe die Schnauze langsam voll! Keine Sonderzeichen! Nimm Zahlen, Buchstaben, Punkte, Leerzeichen und Unterstriche! Beim nächsten Mal bin ich raus!",
        ],
    ],
    ////////////////////////////////
    "EventDateFormat": [
        [
            "Das kann ich so nicht lesen. Bitte formatiere es so: TT.MM.JJJJ HH:MM",
            "Das ist nicht das richtige Format! Versuch es so: TT.MM.JJJJ HH:MM",
        ],
        [
            "So geht das nicht! TT.MM.JJJJ HH:MM ist das richtige Format. *Tag, Monat, Jahr, Stunde, Minute* und das weißt du!",
        ],
        [
            "Jetzt reicht es aber! Du kennst das Format, du weißt wofür es steht! Noch ein Versuch!",
        ]
    ],
    "EventDatePast": [
        [
            "Da hast du dich wohl vertan. Damit würde das Event in der Vergangenheit stattfinden!",
            "Eliminieren! Elimi*nieren*! Bist du es Doctor? Denn du scheinst in der Zeit zurückreisen zu können. Starte das Event in der Zukunft!"
        ],
        [
            "Soll dein Event etwa in der Vergangenheit stattfinden? Ich glaube nicht!",
            "Ich bezweifle, dass du in der Zeit zurückreisen kannst. Starte das Event in der Zukunft!",
            "Das liegt immernoch in der Vergangenheit! Starte das Event gefälligst in der Zukunft!",
        ],
        [
            "Die Zeit läuft davon! ZUKUNFT! Jetzt oder nie!",
            "Deine Zeit ist vorbei... *hust* Ich meine, die Zeit für das Event ist vorbei! Starte es in der Zukunft!",
        ]
    ],
    "EventEndsBeforeStart": [
        [
            "Das Event kann wohl schlecht enden, bevor es begonnen hat. Versuch es nochmal!",
            "Du kannst nichts beenden, das nicht begonnen hat.\n~*Albert Einstein*",
        ],
        [
            "Hast du vor das Raumzeitkontinuum zu zerstören? Denn das wird passieren...",
            "Ich glaube nicht, dass du das Raumzeitkontinuum sprengen willst... Starte das Event in der Zukunft!",
        ],
        [
            "Das Ende ist nahe... noch näher als der Anfang! Was das heißt? Du. bist. nicht. witzig.",
        ]
    ],
    "EventDescriptionTooLong": [
        [
            "Das ist ein bisschen lang, findest du nicht? Versuch es mal mit weniger als 1000 Zeichen!",
            "Mehr als 1000 Zeichen gehen da leider nicht. Versuch es nochmal!",
            "Ich sehe schon, du willst dich ausdrücken, aber mehr als 1000 Zeichen sind nicht erlaubt!",
            "Chuck Norris kann Beschreibungen mit mehr als 1000 Zeichen schreiben. Aber du bist nicht Chuck Norris!",
        ]
    ],
    "ChannelNotFound": [
        [
            "Den Kanal gibt es nicht! Versuch es nochmal!",
        ],
        [
            "Auf diesem Server wirst du damit nicht fündig!",
        ],
        [
            "Du bist auf dem falschen Server... >:(",
        ]
    ],
    "MultipleChannelsFound": [
        [
            "Es gibt mehrere Kanäle mit diesem Namen! Da kann ich nicht wissen, welchen du meinst!",
            "Chuck Norris kann in mehreren Kanälen mit dem gleichen Namen gleichzeitig sein, ich aber nicht! Ich brauche einen eindeutigen Kanalnamen!",
        ],
        [
            "Es tut mir leid, aber mehrere Kanäle mit demselben Namen übersteigen meine Vorstellungskraft!",
        ],
        [
            "Du wirst wohl einen der Kanäle löschen müssen, denn ich kann mich nicht entscheiden!",
        ]
    ],
    "NotAVoiceChannel": [
        [
            "Das ist kein Voice-Channel! Events können nur in Voice-Channels stattfinden!",
            "Chuck Norris kann Events in Text-Channels erstellen. Ich bin nicht Chuck Norris... Ich brauche einen Voice-Channel!"
        ],
        [
            "Immernoch kein Voice-Channel!",
        ],
        [
            "Zum dritten und letzten Mal... Das ist kein Voice-Channel!",
        ]
    ],
        "UsersNotFound": [
        [
            "Du kannst nur Leute einladen, die auf diesem Server sind! Erwähne sie ganz einfach mit @*Nutzername*!",
            "Chuck Norris kann Leute einladen, indem er an sie denkt. Ich nur Nutzer, die auf diesem Server sind und von dir erwähnt werden!"
        ],
        [
            "Nur Nutzer von diesem Server!",
        ],
        [
            "Wie oft soll ich es noch sagen? Nur Nutzer von diesem Server können eingeladen werden!",
        ]
    ]
});
