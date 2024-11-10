import {readFileSync} from 'fs'
import i18next, {t} from 'i18next';
import resources from './config/translations.json'
import {config} from "./config/config";
import {commands} from "./commands";
import dotenv from "dotenv";

if (process.argv[3]) {
    dotenv.config({path: process.argv[3]})
}

i18next.init({
    lng: config().language,
    resources
}).then(() => {
    const executeCommand = commands[process.argv[2]] ?? commands['usage']
    executeCommand().catch(err => console.error(err))
})