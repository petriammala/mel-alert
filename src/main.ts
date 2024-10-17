import {readFileSync} from 'fs'
import {getData, listDevices} from "./data";
import {runInLoop} from "./loop";

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
    console.info('Usage:')
    console.info('npx ts-node src/main <command> <env>')
    console.info('where <command> is one of:', Object.keys(commands).join(', '))
    console.info('and <env> is environmental variables file, defaults to .env')
    return Promise.resolve()
}

const executeCommand = commands[process.argv[2]] ?? commands['usage']
executeCommand().catch(err => console.error(err))
