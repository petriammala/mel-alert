import {Device, MELData} from "./types";
import {config} from "./config/config";
import {sendEmail} from "./emailer";
import {sendNotification} from "./pushover";

function message(msg: string, data: Device & MELData) {
    return `${msg}

 Device: ${data.name}
 Room temperature: ${data.RoomTemperature}
 Target temperature: ${data.SetTemperature}
 OperationMode: ${data.OperationMode}
 Fan speed: ${data.SetFanSpeed}`
}

export function collectAlerts(data: MELData, device: Device) {
    const {alerts} = config()
    const alertMessages = [] as string[]
    for (const alert of alerts.filter(alert => alert.deviceIdOrName == device.id || alert.deviceIdOrName == device.name)) {
        const value = Number(data[alert.key])
        if (Number.isNaN(value)) {
            throw new Error(`Value not a number: ${value}`)
        }
        const msg = message(alert.message, {...device, ...data})
        switch (alert.operator) {
            case '<':
                if (value < alert.value) alertMessages.push(msg)
                break
            case '===':
            case '==':
            case '=':
                if (value == alert.value) alertMessages.push(msg)
                break
            case '>':
                if (value > alert.value) alertMessages.push(msg)
                break
            case '<=':
                if (value <= alert.value) alertMessages.push(msg)
                break
            case '>=':
                if (value >= alert.value) alertMessages.push(msg)
                break
            case '!==':
            case '!=':
            case '<>':
                if (value != alert.value) alertMessages.push(msg)
                break
            default:
                throw new Error(`Unknown operator: ${alert.operator}`)
        }
    }
    return alertMessages
}

export async function send(alerts: string[], data?: Device & MELData) {
    const {mail, pushover} = config()
    if (mail && mail.to) {
        await sendEmail(mail.to, 'MEL Alert', alerts.join('\n'))
    }
    if (pushover && pushover.token) {
        await sendNotification('MEL Alert', alerts.join('\n'), data?.name)
    }

}