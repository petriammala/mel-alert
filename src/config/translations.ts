export const en = {
    translation: {
        data: {
            retry: "Retrying...",
            checkState: "Checking state of devices",
            building: "Building:",
            device: "Device:",
            power: "Power:",
            standby: "Standby:",
            roomTemperature: "Room temperature",
            setTemperature: "Set temperature",
            fanSpeed: "Fan speed:",
            fanSpeed0: "Automatic",
            operationMode: "Operation mode:",
            operationMode0: "Unknown",
            operationMode1: "Heat",
            operationMode2: "Dry",
            operationMode3: "Cool",
            operationMode7: "Fan",
            operationMode8: "Auto",
            lastCommunication: "Last communication:",
            nextCommunication: "Next communication:",
            timeNow: "Time now:",
            nextRun: "Next run at",
            alerts: "Alerts:",
            alertSubject: "MEL Alert"
        },
        main: {
            usage: "Usage:",
            example: "\tnpx ts-node src/main <command> <env>\n",
            exampleExplained: "\twhere <command> is one of: {{commands}}\n\tand <env> is environmental variables file, defaults to .env"
        }
    }
}


export const fi: typeof en = {
    translation: {
        data: {
            retry: "Yritetään uudelleen...",
            checkState: "Tarkistetaan laitteiden tila",
            building: "Rakennus:",
            device: "Laite:",
            power: "Virta:",
            standby: "Virransäästö:",
            roomTemperature: "Huonelämpötila:",
            setTemperature: "Asetettu lämpötila:",
            fanSpeed: "Puhallinnopeus:",
            fanSpeed0: "Automaattinen",
            operationMode: "Käyttötila:",
            operationMode0: "Tuntematon",
            operationMode1: "Lämmitys",
            operationMode2: "Kuivatus",
            operationMode3: "Viilennys",
            operationMode7: "Puhallin",
            operationMode8: "Automaattinen",
            lastCommunication: "Viimeisin viestintä:",
            nextCommunication: "Seuraava viestintä:",
            timeNow: "Aika nyt:",
            nextRun: "Seuraava ajo",
            alerts: "Hälytykset:",
            alertSubject: "MEL hälytys"
        },
        main: {
            usage: "Käyttö:",
            example: "\tnpx ts-node src/main <command> <env>\n",
            exampleExplained: "\tmissä <command> on yksi seuraavista: {{commands}}\n\tja <env> is ympäristömuuttujatiedosto, oletuksena .env"
        }
    }
}
