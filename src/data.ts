import {LoginData, ErrorData, MELData, Building, DevicesByBuilding, Device} from "./types";
import {collectAlerts, send} from './alerts'
import {getJson, postJson} from "./api-client";
import {config} from "./config/config";
import {t} from "i18next";

const context = <{lastUsedContextKey?: string}>{}

export function toTemperatureString(temperature: number) {
    const {temperatureUnit, language} = config()
    const convertedTemperature = Math.round(10 * (temperatureUnit == 'F' ? 1.8 * temperature + 32 : temperature)) / 10
    return `${convertedTemperature.toLocaleString(language)}°${temperatureUnit}`
}

async function login() {
    const {appVersion, language, melCloudUsername, melCloudPassword} = config()
    const loginUrl = 'https://app.melcloud.com/Mitsubishi.Wifi.Client/Login/ClientLogin2'
    const loginData = {
        AppVersion: appVersion,
        CaptchaChallenge: '',
        CaptchaResponse: '',
        Persist: false,
        Email: melCloudUsername,
        Password: melCloudPassword,
    }
    const loginRes = await postJson<LoginData | ErrorData>(loginUrl, loginData)
    if (isErrorData(loginRes)) {
        throw new Error('Login error')
    }
    context.lastUsedContextKey = loginRes.LoginData.ContextKey
    return loginRes.LoginData.ContextKey
}

function isErrorData(data: LoginData | MELData | ErrorData): data is ErrorData {
    return (data as ErrorData).ErrorId != undefined
}

async function withRetries<T>(fn: () => Promise<T>, retryCount: number = 2, resetContextKeyOnFailure: boolean = true) {
    if (retryCount < 0) {
        throw new Error(`Function ${fn.name} failed too many times`)
    }
    try {
        const returnValue = await fn() // needs to be awaited to catch possible errors
        return returnValue
    } catch (err) {
        if (resetContextKeyOnFailure) {
            context.lastUsedContextKey = undefined
        }
        console.error('Error', err instanceof Error ? err.message : 'Unknown error')
        console.info('Retrying...')
        return withRetries(fn, retryCount - 1)
    }
}

async function fetchData(id: number, buildingId: number) {
    async function fetchData() {
        const contextKey = context.lastUsedContextKey ?? await login()
        const fetchDataUrl = `https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/Get?id=${id}&buildingID=${buildingId}`
        const res = await getJson<MELData | ErrorData>(fetchDataUrl, {'X-MitsContextKey': contextKey})
        if (isErrorData(res)) {
            throw new Error(res.ErrorMessage)
        }
        return {
            ...res,
            LastCommunication: new Date(`${res.LastCommunication}Z`),
            NextCommunication: new Date(`${res.NextCommunication}Z`)
        } as MELData
    }
    return withRetries(fetchData)
}

export async function getDevices() {
    async function getDevices() {
        const contextKey = context.lastUsedContextKey ?? await login()
        return getJson<Building[]>('https://app.melcloud.com/Mitsubishi.Wifi.Client/User/ListDevices', {'X-MitsContextKey': contextKey})
    }
    return withRetries(getDevices)
}

export async function listDevices() {
    const buildings = await getDevices()
    for (const building of buildings) {
        console.info(`Building: ${building.Name} (${building.ID})`)
        for (const device of building.Structure.Devices)
            console.info(`\tDevice: ${device.DeviceName} (${device.DeviceID})`)
    }
}

export function dataDetails(device: Device) {
    const {data} = device
    if (!data) {
        return ''
    }
    const {language} = config()
    const date = new Date()
    return `${t('data.power')} ${data.Power}
${t('data.standby')} ${data.InStandbyMode}
${t('data.roomTemperature')} ${toTemperatureString(data.RoomTemperature)}
${t('data.targetTemperature')} ${toTemperatureString(data.SetTemperature)}
${t('data.fanSpeed')} ${data.SetFanSpeed}
${t('data.operationMode')} ${t(`data.operationMode${data.OperationMode}`)} (${data.OperationMode})
${t('data.lastCommunication')} ${data.LastCommunication.toLocaleString(language)}
${t('data.nextCommunication')} ${data.NextCommunication.toLocaleString(language)}
${t('data.timeNow')} ${date.toLocaleString(language)}`
}

async function rawData() {
    const devicesByBuilding = (await getDevices())
        .reduce((acc, building) => ({
            ...acc,
            [building.ID.toString()]: {
                name: building.Name,
                devices: building.Structure.Devices.map(device => ({
                    id: device.DeviceID,
                    name: device.DeviceName
                } as Device))
            }
        }), {} as DevicesByBuilding)
    for (const buildingId of Object.keys(devicesByBuilding)) {
        for (const device of devicesByBuilding[buildingId].devices) {
            device.data = await fetchData(device.id, Number(buildingId))
        }
    }
    return devicesByBuilding
}

export async function getRawData() {
    console.info(JSON.stringify(await rawData(), null,2))
    return Promise.resolve()
}

export async function getData() {
    console.info(t('data.checkState'))
    const devicesByBuilding = await rawData()
    for (const buildingId of Object.keys(devicesByBuilding)) {
        console.info(t('data.building'), devicesByBuilding[buildingId].name, `(${buildingId})`)
        for (const device of devicesByBuilding[buildingId].devices) {
            const alerts = collectAlerts(device)
            console.info(t('data.device'), device.name, `(${device.id})`)
            console.info(dataDetails(device))
            console.info(t('data.alerts'), alerts.length ? alerts.join(', ') : '-')
            if (alerts.length) {
                await send(t('data.alertSubject'), alerts.concat(['', dataDetails(device)]), device.name)
            }
        }
    }
}
