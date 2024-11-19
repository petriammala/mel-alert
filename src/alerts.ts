import {Alert, Device} from "./types";
import {config} from "./config/config";
import {sendEmail} from "./emailer";
import {sendNotification} from "./pushover";
import {t} from "i18next";

export function resolveAlerts(env: NodeJS.ProcessEnv) {
    const alerts = <Alert[]>[]
    for (const envKey in env) {
        if (envKey.startsWith('ALERTS_')) {
            const alertWithoutQuotes = env[envKey].replace(/^"|"$/g, '')
            const [deviceWithCondition, message] = alertWithoutQuotes.split('->').map(s => s.trim())
            const [device, condition] = deviceWithCondition
                .split(':')
                .map(s => s.trim())
            if ([device, condition, message].includes(undefined)) {
                throw new Error(`Unable to interpret alert (${env[envKey]})`)
            }
            alerts.push(<Alert>{
                deviceIdOrName: stringOrNumber(device),
                condition,
                message,
            })
        }
    }
    return alerts

    function stringOrNumber(str: unknown) {
        const n = Number(str)
        return Number.isNaN(n) ? str.toString() : n
    }
}

export function collectAlerts(device: Device) {
    const alerts = resolveAlerts(process.env)
    const alertMessages = <string[]>[]
    for (const alert of alerts.filter(alert => alert.deviceIdOrName == device.id || alert.deviceIdOrName == device.name)) {
        if (new Function(`return ${alert.condition}`).call(device.data)) {
            alertMessages.push(t(alert.message, { device, alert }))
        }
    }
    return alertMessages
}

export async function send(subject: string, alerts: string[], deviceName?: string) {
    const {mail, pushover} = config()
    if (mail && mail.to) {
        await sendEmail(mail.to, subject, alerts.join('\n'))
    }
    if (pushover && pushover.token) {
        await sendNotification(subject, alerts.join('\n'), deviceName)
    }

}