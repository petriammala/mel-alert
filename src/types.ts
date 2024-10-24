export type LoginData = {
    LoginData: { ContextKey: string }
}

export type ErrorData = {
    ErrorId: number
    ErrorMessage: string | null
    LoginStatus: number
    LoginMinutes: number
    LoginAttempts: number
}

enum OperationModes {
    Unknown, Heat, Dry, Cool, Fan = 7, Auto
}

export type MELData = {
    EffectiveFlags: number
    LocalIPAddress: string | null
    RoomTemperature: number
    SetTemperature: number
    SetFanSpeed: number
    OperationMode: OperationModes
    VaneHorizontal: number
    VaneVertical: number
    Name: string | null
    NumberOfFanSpeeds: number
    WeatherObservations: any[] // not typed
    ErrorMessage: string | null
    ErrorCode: number
    DefaultHeatingSetTemperature: number
    DefaultCoolingSetTemperature: number
    HideVaneControls: boolean
    HideDryModeControl: boolean
    RoomTemperatureLabel: number
    InStandbyMode: boolean
    TemperatureIncrementOverride: number
    ProhibitSetTemperature: boolean
    ProhibitOperationMode: boolean
    ProhibitPower: boolean
    DemandPercentage: number
    DeviceID: number
    DeviceType: number
    LastCommunication: Date
    NextCommunication: Date
    Power: boolean
    HasPendingCommand: boolean
    Offline: false
    Scene: string | null
    SceneOwner: string | null
}

export type Alert = {
    deviceIdOrName: number | string
    condition: string
    messageKey: string
}

export type Device = {
    id: number
    name: string
}

export type DevicesByBuilding = {
    [buildingId: string]: {
        name: string
        devices: Device[]
    }
}
export type TemperatureUnit =  'C' | 'F'

export type Config = {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    melCloudUsername: string
    melCloudPassword: string
    alertIntervalMs: number
    temperatureUnit: TemperatureUnit
    appVersion: string
    language?: string
    mail?: {
        from: string
        to: string[]
    }
    pushover?: {
        token: string
        user: string
    }
}

export type Building = {
    ID: number
    Name: string
    Structure: {
        Devices: {
            DeviceID: number
            DeviceName: string
        }[]
    }
}