import {LoginData, ErrorData, MELData} from "./types";
import {collectAlerts, send} from './alerts'
import {getJson, postJson} from "./api-client";
import {config} from "./config/config";

let contextKey = ''

function login() {
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
    return postJson<LoginData | ErrorData>(loginUrl, loginData)
}

function isErrorData(data: LoginData | MELData | ErrorData): data is ErrorData {
    return (data as ErrorData).ErrorId != undefined
}

async function fetchData(id: number, buildingId: number, retry?: number) {
    const fetchDataUrl = `https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/Get?id=${id}&buildingID=${buildingId}`
    const res = await getJson<MELData | ErrorData>(fetchDataUrl, {'X-MitsContextKey': contextKey})
    if (isErrorData(res)) {
        if (retry >= 2) {
            throw new Error('Get data failed too many times')
        }
        const loginRes = await login()
        if (isErrorData(loginRes)) {
            throw new Error('Login error')
        }
        contextKey = loginRes.LoginData.ContextKey
        return fetchData(id, buildingId, retry ? retry + 1 : 1)
    } else {
        return res
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
            console.info('Alerts:', alerts.length ? alerts.join(', ') : '-')
            if (alerts.length) {
                await send(alerts, {...device, ...data})
            }
        }
    }
}
