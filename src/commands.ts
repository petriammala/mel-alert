import {getData, getRawData, listDevices} from "./data";
import {runInLoop} from "./loop";
import {t} from "i18next";

export const commands = <{[key: string]: () => Promise<void>}>{
    raw: getRawData,
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
