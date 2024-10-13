import {Alert, Config} from "../types";
import devicesByBuilding from "./devices.json";
import alerts from "./alerts.json";

export function config(): Config {
    return {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: Number(process.env.SMTP_PORT),
        smtpUsername: process.env.SMTP_USERNAME,
        smtpPassword: process.env.SMTP_PASSWORD,
        melCloudUsername: process.env.MELCLOUD_USERNAME,
        melCloudPassword: process.env.MELCLOUD_PASSWORD,
        alertIntervalMs: Number(process.env.ALERT_INTERVAL_MS ?? 10000),
        devicesByBuilding,
        alerts: alerts as Alert[],
        appVersion: process.env.MELCLOUD_APPVERSION,
        mail: {
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO?.split(','),
        },
        pushover: {
            token: process.env.PUSHOVER_TOKEN,
            user: process.env.PUSHOVER_USER
        }
    }
}
