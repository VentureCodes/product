import {
  NotificationStatus,
  NotificationCategory,
  NotificationType,
} from '@prisma/client'
import { prisma } from '../graphql/context'
import { Client } from 'africastalking-ts'
import { Telegraf } from 'telegraf'
import nodemailer from 'nodemailer'

type NotificationBody = {
  message: string
  additionalData?: object
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
})

export class Notification {
  recipientId: string
  notificationId?: string
  title?: string
  body: NotificationBody
  status: NotificationStatus
  category: NotificationCategory
  type: NotificationType

  /**
   * Creates an instance of the Notification class.
   * @param recipientId - The ID of the recipient of the notification.
   * @param notificationId - The unique ID of the notification (optional).
   * @param title - The title of the notification (optional).
   * @param body - The content of the notification (message and optional additional data).
   * @param status - The current status of the notification.
   * @param category - The category type of the notification.
   * @param type - The type of the notification (e.g., InApp, SMS, Telegram).
   */

  constructor(
    recipientId: string,
    notificationId: string,
    title: string,
    body: NotificationBody,
    status: NotificationStatus,
    category: NotificationCategory,
    type: NotificationType,
  ) {
    this.recipientId = recipientId
    this.notificationId = notificationId
    this.title = title
    this.body = body
    this.status = status
    this.category = category
    this.type = type
  }

  /**
   * Sends an in-app notification and stores it in the database.
   * @param externalError - An optional error to store in the notification (if applicable).
   * @returns A promise that resolves to the created notification record in the database.
   */
  async sendInAppNotification(externalError?: any) {
    try {
      return await prisma.notification.create({
        data: {
          title: this.title!,
          body: this.body,
          status: this.status,
          category: this.category,
          type: this.type,
          user: {
            connect: { id: this.recipientId },
          },
          externalError: externalError || null,
        },
      })
    } catch (error) {
      console.log('Error sending in-app notification', error)
      return error
    }
  }

  /**
   * Sends an SMS notification using the Africa's Talking API.
   * @param phone - The recipient's phone number.
   * @returns A promise that resolves to the SMS sending result.
   */
  async sendSMSNotification(phone: string) {
    try {
      const FROM = process.env.AFRICA_TALKING_SENDER_ID!
      const AFRICA_TALKING_NOW_USERNAME =
        process.env.AFRICA_TALKING_NOW_USERNAME!
      const AFRICA_TALKING_NOW_KEY = process.env.AFRICA_TALKING_NOW_KEY!

      const africastalking = new Client({
        apiKey: AFRICA_TALKING_NOW_KEY!,
        username: AFRICA_TALKING_NOW_USERNAME!,
      })

      let phoneNumbers: string[] = [phone]
      // ensure phoneNumbers has + prefix
      phoneNumbers = phoneNumbers.map((phone) =>
        phone.startsWith('+') ? phone : `+${phone}`,
      )

      const options = {
        to: phoneNumbers,
        from: FROM,
        message: this.body.message,
      }

      const res = await africastalking.sendSms(options)

      if (res) {
        await this.sendInAppNotification()
      }

      return res
    } catch (error) {
      console.log('Error sending SMS', error)
      return error
    }
  }

  /**
   * Sends a notification to Telegram users, optionally with a photo.
   * @param photoBuffer - An optional image buffer to send as a photo with the message.
   * @returns A promise that resolves to the result of the Telegram message or photo send.
   */
  async sendTelegramNotification(photoBuffer?: Buffer) {
    try {
      const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN_EQAM!)

      for (const user of process.env.TELEGRAM_USERS!.split(',')) {
        const formatedMsg = this.formatTelegramMessage(this.body.message)

        if (!photoBuffer) {
          await bot.telegram.sendMessage(user, formatedMsg, {
            parse_mode: 'MarkdownV2',
          })

          await this.sendInAppNotification()

          continue
        }

        const msg = await bot.telegram.sendPhoto(
          user,
          { source: photoBuffer! },
          { caption: formatedMsg, parse_mode: 'MarkdownV2' },
        )

        await this.sendInAppNotification()

        return msg
      }
      return null
    } catch (error) {
      console.log('Error sending message', error)
      await this.sendInAppNotification(JSON.stringify(error))
      return error
    }
  }

  /**
   * Sends an email notification, optionally including details of an external error.
   *
   * @param externalError - Optional parameter to include information about an external error.
   * @returns A promise that resolves when the email notification is sent.
   */
  async sendEmailNotification(externalError?: any) {
    try {
      this.validateEnvVariables()

      const user = await prisma.user.findFirst({
        where: { id: this.recipientId },
        select: { email: true },
      })

      if (!user?.email) return

      const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
          h1 { color: #000000; text-align: center; font-size: 28px; font-weight: bold; }
          p { color: #333333; font-size: 16px; line-height: 1.6; text-align: center; }
          .content { margin-top: 20px; padding: 20px; text-align: center; }
          .logo { display: block; margin: 0 auto 20px; max-width: 150px; }
          .footer { font-size: 12px; text-align: center; color: #999999; margin-top: 40px; }
          .button { background-color: #D6FC3E; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://app.dollarsapp.ai/logo.png" alt="Dollars App Logo" class="logo">
          <div class="content">
            <p>${this.body.message}</p>
            <a href="https://app.dollarsapp.ai/" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>If you have any questions, feel free to contact us at mailto:support@dollarapp.me</p>
            <p>&copy; ${new Date()?.getFullYear()} Dollars App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `

      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: this.title!,
        text: this.body.message,
        html: emailHTML,
      })

      return await prisma.notification.create({
        data: {
          title: this.title!,
          body: this.body,
          status: this.status,
          category: this.category,
          type: this.type,
          user: {
            connect: { id: this.recipientId },
          },
          externalError: externalError || null,
        },
      })
    } catch (error) {
      console.log('Error sending E-mail notification', error)
      return error
    }
  }

  /**
   * Escapes special characters in a Telegram message to make it compatible with MarkdownV2 formatting.
   * @param message - The message to format.
   * @returns The formatted message as a string.
   */
  formatTelegramMessage = (message: string) => {
    return message
      .replaceAll('_', '\\_')
      .replaceAll('-', '\\-')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll('`', '\\`')
      .replaceAll('~', '\\~')
      .replaceAll('>', '\\>')
      .replaceAll('#', '\\#')
      .replaceAll('+', '\\+')
      .replaceAll('.', '\\.')
      .replaceAll('!', '\\!')
      .replaceAll('/', '\\/')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
  }

  /**
   * Updates the status of the notification in the database.
   * @param newStatus - The new notification status.
   * @returns A promise that resolves to the result of the update operation.
   */
  updateStatus(newStatus: NotificationStatus) {
    this.status = newStatus

    return prisma.notification.updateMany({
      where: {
        id: this.notificationId,
        userId: this.recipientId,
      },
      data: {
        status: this.status!,
      },
    })
  }

  validateEnvVariables() {
    if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD) {
      throw new Error(
        'Missing environment variables: SENDER_EMAIL and SENDER_PASSWORD must be set',
      )
    }
  }
}
