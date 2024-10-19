import {Device, MELData} from "./types";
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

function resolveNumberValue(value: unknown): number {
    if (typeof value == 'number') {
        return value
    }
    if (typeof value == 'boolean') {
        return value ? 1 : 0
    }
    if (typeof value == 'string') {
        const dateValue = new Date(`${value}Z`)
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
        const convertFn = alert.key.toLowerCase().includes('temperature') ? toTemperatureString : (value: number) => value
        const value = alert.value
        const convertedValue = convertFn(resolveNumberValue(value))
        const dataValue = data[alert.key]
        const convertedDataValue = convertFn(resolveNumberValue(data[alert.key]))
        const msg = message(t(alert.messageKey, { value: convertedValue, dataValue: convertedDataValue, device, data }), {...device, ...data})
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

export async function send(subject: string, alerts: string[], data?: Device & MELData) {
    const {mail, pushover} = config()
    if (mail && mail.to) {
        await sendEmail(mail.to, subject, alerts.join('\n'))
    }
    if (pushover && pushover.token) {
        await sendNotification(subject, alerts.join('\n'), data?.name)
    }

}