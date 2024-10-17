import {LoginData, ErrorData, MELData, Building, OperationModes, DevicesByBuilding} from "./types";
import {collectAlerts, send} from './alerts'
import {getJson, postJson} from "./api-client";
import {config} from "./config/config";

const context = <{lastUsedContextKey?: string}>{}

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
        throw new Error(`Function ${fn} failed too many times`)
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
    return withRetries(async () => {
        const contextKey = context.lastUsedContextKey ?? await login()
        const fetchDataUrl = `https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/Get?id=${id}&buildingID=${buildingId}`
        const res = await getJson<MELData | ErrorData>(fetchDataUrl, {'X-MitsContextKey': contextKey})
        if (isErrorData(res)) {
            throw new Error(res.ErrorMessage)
        } else {
            return res
        }
    })
}

export async function getDevices() {
    return withRetries(async () => {
        const contextKey = context.lastUsedContextKey ?? await login()
        return getJson<Building[]>('https://app.melcloud.com/Mitsubishi.Wifi.Client/User/ListDevices', {'X-MitsContextKey': contextKey})
    })
}

export async function listDevices() {
    const buildings = await getDevices()
    for (const building of buildings) {
        console.info(`Building: ${building.Name} (${building.ID})`)
        for (const device of building.Structure.Devices)
            console.info(`\tDevice: ${device.DeviceName} (${device.DeviceID})`)
    }
}

export async function getData() {
    const devicesByBuilding = (await getDevices())
        .reduce((acc, building) => ({
                ...acc,
                [building.ID]: {
                    name: building.Name,
                    devices: building.Structure.Devices.map(device => ({id: device.DeviceID, name: device.DeviceName}))
                }
        }), {} as DevicesByBuilding)
    console.info('Checking state of devices')
    for (const buildingId of Object.keys(devicesByBuilding)) {
        console.info('Building:', devicesByBuilding[buildingId].name, `(${buildingId})`)
        for (const device of devicesByBuilding[buildingId].devices) {
            console.info('Device:', device.name, `(${device.id})`)
            const data = await fetchData(device.id, Number(buildingId))
            const alerts = collectAlerts(data, device)
            const date = new Date()
            const lastCommunication = new Date(`${data.LastCommunication}Z`)
            const nextCommunication = new Date(`${data.NextCommunication}Z`)
            console.info('Power:', data.Power)
            console.info('Standby:', data.InStandbyMode)
            console.info('Room temperature:', data.RoomTemperature)
            console.info('Target temperature:', data.SetTemperature)
            console.info('Fan speed:', data.SetFanSpeed)
            console.info('Operation mode:', OperationModes[data.OperationMode], `(${data.OperationMode})`)
            console.info('Last communication:', lastCommunication.toLocaleString())
            console.info('Next communication:', nextCommunication.toLocaleString())
            console.info('Time now:', date.toLocaleString())
            console.info('Alerts:', alerts.length ? alerts.join(', ') : '-')
            if (alerts.length) {
                await send(alerts, {...device, ...data})
            }
        }
    }
}
