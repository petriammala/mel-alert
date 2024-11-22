import {Config, TemperatureUnit} from "../types";

export function config(): Config {
    return {
        melCloudUsername: process.env.MELCLOUD_USERNAME,
        melCloudPassword: process.env.MELCLOUD_PASSWORD,
        alertIntervalMs: Number(process.env.ALERT_INTERVAL_MS ?? 10000),
        temperatureUnit: (process.env.TEMPERATURE_UNIT ?? 'C') as TemperatureUnit,
        appVersion: process.env.MELCLOUD_APPVERSION,
        language: process.env.LANGUAGE ?? 'en',
        mail: process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD ? {
            smtpHost: process.env.SMTP_HOST,
            smtpPort: Number(process.env.SMTP_PORT),
            smtpUsername: process.env.SMTP_USERNAME,
            smtpPassword: process.env.SMTP_PASSWORD,
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO?.split(','),
        } : undefined,
        pushover: process.env.PUSHOVER_TOKEN && process.env.PUSHOVER_USER ? {
            token: process.env.PUSHOVER_TOKEN,
            user: process.env.PUSHOVER_USER
        } : undefined
    }
}
