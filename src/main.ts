import {readFileSync} from 'fs'
import {getData, listDevices} from "./data";
import {runInLoop} from "./loop";
import i18next, {t} from 'i18next';
import resources from './config/translations.json'

if (process.argv[3]) {
    readFileSync(process.argv[3])
        .toString()
        .split('\n')
        .filter(line => line.trim() != '' && !line.startsWith('#'))
        .map(line => line.split('='))
        .forEach(([name, value]) => process.env[name] = value)
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
    lng: process.env.LANG ?? 'en',
    resources
}).then(() => {
    const executeCommand = commands[process.argv[2]] ?? commands['usage']
    executeCommand().catch(err => console.error(err))
})