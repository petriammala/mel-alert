import {createTransport} from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'
import * as SMTPTransport from 'nodemailer/lib/smtp-transport'
import {config} from "./config/config";

function transportOptions(): SMTPTransport.Options {
    const {smtpHost, smtpPort, smtpUsername, smtpPassword} = config()
    return {
        host: smtpHost,
        port: smtpPort,
        tls: {
        ciphers:'SSLv3'
    },
        auth: {
            user: smtpUsername,
                pass: smtpPassword,
        }
    }
}

export function sendEmail(to: string[], subject: string, text: string, attachment?: Attachment) {
    const {mail} = config()
    const transporter = createTransport(transportOptions())
    return transporter.sendMail({
        from: mail.from,
        to,
        subject,
        text,
        html: text.replace(/\n/g, '<br />'),
        attachments: attachment ? [attachment] : undefined
    })
}
