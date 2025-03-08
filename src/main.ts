import {readFileSync} from 'fs'
import i18next, {t} from 'i18next';
import {config} from "./config/config";
import {commands} from "./commands";
import dotenv from "dotenv";
import {en, fi} from "./config/translations";

process.argv[3] ? dotenv.config({path: process.argv[3]}) : dotenv.config()

i18next.init({
    lng: config().language,
    resources: { en, fi }
}).then(() => {
    const executeCommand = commands[process.argv[2]] ?? commands['usage']
    executeCommand().catch(err => console.error(err))
})