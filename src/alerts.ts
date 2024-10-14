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

function resolveNumberValue(value: unknown): number {
    if (typeof value == 'number') {
        return value
    }
    if (typeof value == 'boolean') {
        return value ? 1 : 0
    }
    if (typeof value == 'string') {
        const dateValue = new Date(value)
        if (dateValue.toString() != 'Invalid Date' ) {
            return dateValue.getTime()
        }
        const now = new Date()
        switch (value) {
            case '$yesterday': {
                const yesterday = new Date(now.getFullYear(),now.getMonth(),now.getDate() - 1)
                return yesterday.getTime()
            }
            case '$today': {
                const today = new Date(now.getFullYear(),now.getMonth(),now.getDate())
                return today.getTime()
            }
            case 'tomorrow': {
                const tomorrow = new Date(now.getFullYear(),now.getMonth(),now.getDate() + 1)
                return tomorrow.getTime()
            }
            case '$now': return now.getTime()
        }
    }
    throw new Error(`Unable to resolve number value for ${JSON.stringify(value)}`)
}

export function collectAlerts(data: MELData, device: Device) {
    const {alerts} = config()
    const alertMessages = [] as string[]
    for (const alert of alerts.filter(alert => alert.deviceIdOrName == device.id || alert.deviceIdOrName == device.name)) {
        const value = resolveNumberValue(alert.value)
        const dataValue = resolveNumberValue(data[alert.key])
        const msg = message(alert.message, {...device, ...data})
        switch (alert.operator) {
            case '<':
                if (dataValue < value) alertMessages.push(msg)
                break
            case '===':
            case '==':
            case '=':
                if (dataValue == value) alertMessages.push(msg)
                break
            case '>':
                if (dataValue > value) alertMessages.push(msg)
                break
            case '<=':
                if (dataValue <= value) alertMessages.push(msg)
                break
            case '>=':
                if (dataValue >= value) alertMessages.push(msg)
                break
            case '!==':
            case '!=':
            case '<>':
                if (dataValue != value) alertMessages.push(msg)
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