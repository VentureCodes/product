import { Client } from 'africastalking-ts'
import twilio from 'twilio'
import bot from './bot'

/**
 * sendSMSWithTwilio: Send SMS using Twillio
 * @param opts: {
 * phone: string;
 * message: string;
 * from: string;
 * twillio_sid: string;
 * twillio_token: string;
 * }
 * @returns
 */
export const sendSMS = async (opts: {
  phone: string
  message: string
}): Promise<{
  message: string | null
  error: string | null
}> => {
  try {
    if (
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_ACCOUNT_AUTH_TOKEN
    ) {
      const from = process.env.TWILIO_PHONE_NUMBER!
      const twillio_sid = process.env.TWILIO_ACCOUNT_SID!
      const twillio_token = process.env.TWILIO_ACCOUNT_AUTH_TOKEN!
      const { phone, message } = opts
      const client = twilio(twillio_sid, twillio_token)
      const resp: any = await client.messages.create({
        body: message,
        to: phone,
        from,
      })

      console.log(resp.message)
      return {
        error: null,
        message: resp,
      }
    }
    return {
      message: null,
      error: 'There are no environment variables',
    }
  } catch (error) {
    return {
      error: `Error sending messaging ${error}`,
      message: null,
    }
  }
}

/**
 * Send SMS using Africas'Talking Now
 * @param AFRICA_TALKING_NOW_KEY
 * @param AFRICA_TALKING_NOW_USERNAME
 * @param phoneNumbers
 * @param message
 * @param FROM
 * @returns
 */
export const sendSMSPP = async (
  AFRICA_TALKING_NOW_KEY: string,
  AFRICA_TALKING_NOW_USERNAME: string,
  phoneNumbers: string[],
  message: string,
  _FROM?: string,
) => {
  const africastalking = new Client({
    apiKey: AFRICA_TALKING_NOW_KEY!,
    username: AFRICA_TALKING_NOW_USERNAME!,
  })
  // ensure phoneNumbers has + prefix

  phoneNumbers = phoneNumbers.map((phone) =>
    phone.startsWith('+') ? phone : `+${phone}`,
  )

  const from = 'NGENI'
  const options = from
    ? {
        to: phoneNumbers,
        from: from,
        message,
      }
    : {
        to: phoneNumbers,
        message,
      }
  const res = await africastalking.sendSms(options)
  return res
}

const frtMsg = (message: string) =>
  message
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

export const sendTgMsg = async (message: string, photoBuffer?: Buffer) => {
  try {
    for (const user of process.env.TELEGRAM_USERS!.split(',')) {
      const frtedMsg = frtMsg(message)

      if (!photoBuffer) {
        bot.telegram.sendMessage(user, frtedMsg, {
          parse_mode: 'MarkdownV2',
        })
      }
      // user.forEach(async (chatId: any) => {
      const msg = await bot.telegram
        .sendPhoto(
          user,
          { source: photoBuffer! },
          { caption: frtedMsg, parse_mode: 'MarkdownV2' },
        )
        .then(() => {
          console.log('Message sent to:', user)
          return 'Message sent successfully'
        })

        .catch((error: any) => {
          // ERROR HANDLING
          console.log('Error sending message to:', user, error)
          const errorCode = error.response?.error_code
          const errorDescription = error.response?.description

          if (
            errorCode === 400 &&
            errorDescription === 'Bad Request: chat not found'
          ) {
            console.error(
              `ChatId ${user} not found. User has not started the bot yet`,
            )
            return 'ChatId not found'
          } else if (
            errorCode === 400 &&
            errorDescription.includes("can't parse entities")
          ) {
            console.error(`Message contains invalid entities. ChatId: ${user}`)
            return 'Message contains invalid entities'
          } else {
            console.error(
              `Error sending message to User:`,
              user,
              error.message || errorDescription,
            )
            return 'Error sending message to User'
          }
        })
      return msg
      // })
      // return 'Message sent successfully. Receipients: ' + user
    }
    return null
  } catch (error) {
    console.log('Error sending message with photo', error)
    return error
  }
}
