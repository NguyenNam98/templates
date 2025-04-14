import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { Attachment } from 'nodemailer/lib/mailer'

import * as handlebars from 'handlebars'
import * as moment from 'moment'
import * as stream from 'stream'
import * as fs from 'fs'

type TEmailAttachment = {
  filename: string
  [key: string]: Buffer | string | stream.Readable
}

type TSentMailContent = {
  to: string | string[]
  message: {
    subject: string
    attachments: TEmailAttachment[]
    html: string
  }
}

@Injectable()
export class SendEmailService {
  private readonly logger = new Logger(SendEmailService.name)
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST, // SMTP host, e.g., smtp.gmail.com
      port: parseInt(process.env.NODEMAILER_PORT ?? '587') ?? 587, // SMTP port, 587 for TLS
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_USER, // Email user
        pass: process.env.NODEMAILER_PASS, // Email password or app-specific password
      },
    })
  }

  async nodemailerSendHTML(
    to: string,
    subject: string,
    html: string,
    attachments?: Attachment[],
  ): Promise<void> {
    const mailOptions = {
      from: process.env.NODEMAILER_FROM, // Sender address
      to, // Recipient address
      subject, // Subject line
      html, // Optional HTML body
      attachments, // Optional attachments
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      this.logger.log(`Email sent: ${info.messageId}`)
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`)
    }
  }

  composeEmailUsingHandlebars = (
    template: string,
    content: unknown,
  ): string => {
    const currentYear = moment().year()
    try {
      return handlebars.compile(template)({
        ...(content as Record<string, unknown>),
        year: currentYear,
      })
    } catch (e) {
      console.log('Error to combine data with template', e)
      return ''
    }
  }

  sendMailServiceUsingNodemailer = async (
    addresses: string | string[],
    content: unknown,
    folder: string,
    subject: string,
    attachments?: TEmailAttachment | TEmailAttachment[],
  ): Promise<TSentMailContent | null> => {
    try {
      const template = fs.readFileSync(folder, 'utf8')
      if (!template) {
        console.error('Cannot find a template')
        return null
      }

      const completedEmail = this.composeEmailUsingHandlebars(template, content)

      const emailAddresses = Array.isArray(addresses) ? addresses : [addresses]

      const sendingAttachments = Array.isArray(attachments)
        ? attachments
        : attachments
        ? [attachments]
        : []
      await Promise.allSettled(
        emailAddresses.map(async (email) =>
          this.nodemailerSendHTML(
            email,
            subject,
            completedEmail,
            sendingAttachments.map((attachment) => ({
              filename: attachment.filename,
              content: attachment.content,
            })),
          ),
        ),
      )

      return {
        to: emailAddresses,
        message: {
          subject: subject,
          attachments: sendingAttachments,
          html: completedEmail,
        },
      }
    } catch (e) {
      console.log('Error to send email', e)
      return null
    }
    return null
  }
}
