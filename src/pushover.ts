import {config} from "./config/config";
import {postJson} from "./api-client";
import {PushoverOptions} from "./types";

export function sendNotification(pushover: PushoverOptions, title: string, message: string, deviceName?: string) {
    return postJson('https://api.pushover.net/1/messages.json', {
        token: pushover.token,
        user: pushover.user,
        device: deviceName ?? 'No device',
        title,
        message
        }
    )
}