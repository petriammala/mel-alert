import {LoginData, ErrorData, MELData, Building, OperationModes} from "./types";
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
    return loginRes.LoginData.ContextKey
}

function isErrorData(data: LoginData | MELData | ErrorData): data is ErrorData {
    return (data as ErrorData).ErrorId != undefined
}

async function fetchData(id: number, buildingId: number, retry?: number) {
    const contextKey = context.lastUsedContextKey ?? await login()
    const fetchDataUrl = `https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/Get?id=${id}&buildingID=${buildingId}`
    const res = await getJson<MELData | ErrorData>(fetchDataUrl, {'X-MitsContextKey': contextKey})
    if (isErrorData(res)) {
        if (retry >= 2) {
            throw new Error('Get data failed too many times')
        }
        context.lastUsedContextKey = undefined
        return fetchData(id, buildingId, retry ? retry + 1 : 1)
    } else {
        context.lastUsedContextKey = contextKey
        return res
    }
}

export async function listDevices() {
    const contextKey = context.lastUsedContextKey ?? await login()
    const buildings = await getJson<Building[]>('https://app.melcloud.com/Mitsubishi.Wifi.Client/User/ListDevices', {'X-MitsContextKey': contextKey})
    for (const building of buildings) {
        console.info(`Building: ${building.Name} (${building.ID})`)
        for (const device of building.Structure.Devices)
            console.info(`\tDevice: ${device.DeviceName} (${device.DeviceID})`)
    }
}

export async function getData() {
    const {devicesByBuilding, alertIntervalMs} = config()
    console.info('Checking state of devices')
    for (const buildingId of Object.keys(devicesByBuilding)) {
        console.info('Building:', devicesByBuilding[buildingId].name, `(${buildingId})`)
        for (const device of devicesByBuilding[buildingId].devices) {
            console.info('Device:', device.name, `(${device.id})`)
            const data = await fetchData(device.id, Number(buildingId))
            const alerts = collectAlerts(data, device)
            console.info('Power:', data.Power)
            console.info('Standby:', data.InStandbyMode)
            console.info('Room temperature:', data.RoomTemperature)
            console.info('Target temperature:', data.SetTemperature)
            console.info('Fan speed:', data.SetFanSpeed)
            console.info('Operation mode:', OperationModes[data.OperationMode], `(${data.OperationMode})`)
            console.info('Alerts:', alerts.length ? alerts.join(', ') : '-')
            if (alerts.length) {
                await send(alerts, {...device, ...data})
            }
        }
    }
}
