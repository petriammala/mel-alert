import {createTransport} from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'
import * as SMTPTransport from 'nodemailer/lib/smtp-transport'
import {config} from "./config/config";
import {MailOptions} from "./types";

function transportOptions(): SMTPTransport.Options {
    const {mail} = config()

    return {
        host: mail?.smtpHost,
        port: mail?.smtpPort,
        tls: {
        ciphers:'SSLv3'
    },
        auth: {
            user: mail?.smtpUsername,
                pass: mail?.smtpPassword,
        }
    }
}

export function sendEmail(mail: MailOptions, subject: string, text: string, attachment?: Attachment) {
    const transporter = createTransport(transportOptions())
    return transporter.sendMail({
        from: mail.from,
        to: mail.to,
        subject,
        text,
        html: text.replace(/\n/g, '<br />'),
        attachments: attachment ? [attachment] : undefined
    })
}
