import {config} from "./config/config";
import {send} from "./alerts";
import {getData} from "./data";

function loop() {
    const {alertIntervalMs} = config()
    getData().catch(err => {
        console.error(err)
        void send([err instanceof Error ? err.message : 'Unknown error'])
    }).finally(() => {
        console.info(`\nNext run at ${alertIntervalMs} ms\n`)
        setTimeout(loop, alertIntervalMs)
    })
}

loop()