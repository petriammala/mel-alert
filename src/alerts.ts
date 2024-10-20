import {Alert, Device, MELData} from "./types";
import {config} from "./config/config";
import {sendEmail} from "./emailer";
import {sendNotification} from "./pushover";
import {t} from "i18next";
import {toTemperatureString} from "./data";

function message(msg: string, data: Device & MELData) {
    return `${msg}

 ${t('data.device')} ${data.name}
 ${t('data.roomTemperature')} ${toTemperatureString(data.RoomTemperature)}
 ${t('data.targetTemperature')} ${toTemperatureString(data.SetTemperature)}
 ${t('data.operationMode')} ${t(`data.operationMode${data.OperationMode}`)} (${data.OperationMode})
 ${t('data.fanSpeed')} ${data.SetFanSpeed}`
}

export function resolveAlerts(env: NodeJS.ProcessEnv) {
    const alerts = <Alert[]>[]
    for (const envKey in env) {
        if (envKey.startsWith('ALERTS_')) {
            const [deviceWithCondition, messageKey] = env[envKey].split('->').map(s => s.trim())
            const [device, condition] = deviceWithCondition.split(':').map(s => s.trim())
            if ([device, condition, messageKey].includes(undefined)) {
                throw new Error(`Unable to interpret alert (${env[envKey]})`)
            }
            alerts.push(<Alert>{
                deviceIdOrName: stringOrNumber(device),
                condition,
                messageKey,
            })
        }
    }
    return alerts

    function stringOrNumber(str: unknown) {
        const n = Number(str)
        return Number.isNaN(n) ? str.toString() : n
    }
}

export function collectAlerts(data: MELData, device: Device) {
    const alerts = resolveAlerts(process.env)
    const alertMessages = <string[]>[]
    for (const alert of alerts.filter(alert => alert.deviceIdOrName == device.id || alert.deviceIdOrName == device.name)) {
        if (new Function(`return ${alert.condition}`).call(data)) {
            const msg = message(t(alert.messageKey, { device, data, alert }), {...device, ...data})
            alertMessages.push(msg)
        }
    }
    return alertMessages
}

export async function send(subject: string, alerts: string[], data?: Device & MELData) {
    const {mail, pushover} = config()
    if (mail && mail.to) {
        await sendEmail(mail.to, subject, alerts.join('\n'))
    }
    if (pushover && pushover.token) {
        await sendNotification(subject, alerts.join('\n'), data?.name)
    }

}