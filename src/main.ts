import {readFileSync} from 'fs'
import {getData, listDevices} from "./data";
import {runInLoop} from "./loop";
import i18next, {t} from 'i18next';
import resources from './config/translations.json'
import {config} from "./config/config";

if (process.argv[3]) {
    readFileSync(process.argv[3])
        .toString()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line != '' && !line.startsWith('#'))
        .map(line => line.split(/=(.*)/s).map(part => part.trim()))
        .forEach(([name, value]) => process.env[name] = value.replace(/^"?([^"]*)"?$/, '$1'))
}

const commands = <{[key: string]: () => Promise<void>}>{
    data: getData,
    loop: runInLoop,
    buildings: listDevices,
    devices: listDevices,
    usage: showUsage
}

function showUsage() {
    console.info(t('main.usage'))
    console.info(t('main.example'))
    console.info(t('main.exampleExplained', { commands: Object.keys(commands).join(', ') }))
    return Promise.resolve()
}


i18next.init({
    lng: config().language,
    resources
}).then(() => {
    const executeCommand = commands[process.argv[2]] ?? commands['usage']
    executeCommand().catch(err => console.error(err))
})