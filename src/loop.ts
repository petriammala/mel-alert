import {config} from "./config/config";
import {send} from "./alerts";
import {getData} from "./data";
import {t} from "i18next";

export function runInLoop() {
    const {alertIntervalMs} = config()
    getData().catch(err => {
        console.error(err)
        void send(t('data.alertSubject'), [err instanceof Error ? err.message : 'Unknown error'])
    }).finally(() => {
        console.info(`\n${t('data.nextRun')} ${new Date(new Date().getTime() + alertIntervalMs).toLocaleString()}\n`)
        setTimeout(runInLoop, alertIntervalMs)
    })
    return Promise.resolve()
}
