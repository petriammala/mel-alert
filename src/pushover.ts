import {config} from "./config/config";
import {postJson} from "./api-client";

export function sendNotification(title: string, message: string, deviceName?: string) {
    const {pushover} = config()
    return postJson('https://api.pushover.net/1/messages.json', {
        token: pushover.token,
        user: pushover.user,
        device: deviceName ?? 'No device',
        title,
        message
        }
    )
}