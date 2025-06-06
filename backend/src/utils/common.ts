import { faker } from '@faker-js/faker'
import { prisma } from './../graphql'
import { randomBytes } from 'crypto'
// import twilio from 'twilio'
import { Client } from 'africastalking-ts'

/**
 * The function generates a random numeric one-time password (OTP) of a specified length.
 * @param [length=6] - The `length` parameter in the `generateOTP` function specifies the length of the
 * OTP (One Time Password) that will be generated. By default, if no length is provided, the OTP will
 * be 6 digits long. You can customize the length of the OTP by passing a different number as
 * @returns The function `generateOTP` returns a randomly generated numeric OTP (One Time Password) of
 * the specified length.
 */
export const generateOTP = (length = 6) => {
  // Declare a digits variable which stores all digits
  // TODO: generate only number OTP
  let digits = '0123456789'
  let otp = ''
  let len = digits.length
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * len)]
  }

  return otp
}

/**
 * randomUser generates a random user name with a specified length.
 * @param length - length of the random user name
 * @returns string
 */
export const randomUser = (length = 6) => {
  const prefix = '@user-'
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return `${prefix + result}`.toLocaleLowerCase()
}

/**
 * generateRandomKenyaPhoneNumber generates a random Kenyan phone number.
 * Used for testing only
 * @returns
 */
export const generateRandomKenyaPhoneNumber = () => {
  const countryCode = '+2547'
  const randomDigits = Math.floor(Math.random() * Math.pow(10, 8))
    .toString()
    .padStart(8, '0')
  return countryCode + randomDigits
}

/**
 * formatPhoneNumberWithCountryCode formats a phone number with a country code.
 * @param phone string
 * @param dialCode string
 * @returns string
 */
export const formatPhoneNumberWithCountryCode = (
  phone: string,
  dialCode: string = '254',
) => {
  let phoneNumber = ''
  if (phone.startsWith(dialCode)) {
    phoneNumber = phone
  } else if (phone.startsWith('0')) {
    phoneNumber = phone.replace('0', dialCode)
  } else if (phone.startsWith('7')) {
    phoneNumber = dialCode + phone
  } else if (phone.startsWith('1')) {
    phoneNumber = dialCode + phone
  } else if (phone.startsWith('+')) {
    phoneNumber = phone.replace('+', '')
  } else if (phone.startsWith('+254')) {
    phoneNumber = phone.replace('+', '')
  }
  return phoneNumber
}

/**
 * Generate the next invoice number.
 *
 * @param invoiceNumber - The current invoice number.
 * @returns The next invoice number.
 * @throws Will throw an error if the invoice number is empty.
 */
export const nextSequence = async (invoiceNumber: string): Promise<string> => {
  if (!invoiceNumber) {
    invoiceNumber = 'DOLL/PUSH/USER/-000000001'
  }

  const segments = invoiceNumber.split(/[_/:\-;\\]+/)
  const lastSegment = segments.pop()
  if (!lastSegment) {
    throw new Error('Invalid invoice number format')
  }

  const priorSegment = invoiceNumber.slice(
    0,
    invoiceNumber.lastIndexOf(lastSegment),
  )
  let nextNumber = alphaNumericIncrementer(lastSegment)

  if (
    await prisma.fiatTransaction.findFirst({
      where: { invoiceNumber: nextNumber },
    })
  ) {
    nextNumber = alphaNumericIncrementer(nextNumber + 1)
  }

  return priorSegment + nextNumber
}

/**
 * Increment an alphanumeric string by one.
 * @param str - The alphanumeric string to increment.
 * @returns The incremented alphanumeric string.
 * @throws Will throw an error if the input string is empty.
 */
const alphaNumericIncrementer = (str: string): string => {
  if (!str) {
    throw new Error('str cannot be empty')
  }

  let invNum = str.replace(/[^a-z0-9]/gi, '').toUpperCase()
  let index = invNum.length - 1
  const lastCharCode = 'Z'.charCodeAt(0)
  const lastDigitCode = '9'.charCodeAt(0)

  while (index >= 0) {
    const currentCharCode = invNum.charCodeAt(index)

    if (currentCharCode === lastDigitCode) {
      invNum = invNum.slice(0, index) + '0' + invNum.slice(index + 1)
    } else if (currentCharCode === lastCharCode) {
      invNum = invNum.slice(0, index) + 'A' + invNum.slice(index + 1)
    } else {
      const nextChar = String.fromCharCode(currentCharCode + 1)
      invNum = invNum.slice(0, index) + nextChar + invNum.slice(index + 1)
      break
    }
    index--
  }

  if (index < 0) {
    invNum = '1' + invNum
  }

  return invNum
}

/**
 * The function checks if a phone number has consecutive digits.
 * @param phoneNumber - The `phoneNumber` parameter in the `checkIfPhoneNumberHasConsertive4Zeros` function specifies the phone number to be checked.
 * @returns The function `checkIfPhoneNumberHasConsertive4Zeros` returns a boolean value indicating if the phone number has consecutive digits.
 */
export const checkIfPhoneNumberHasConsertive4Zeros = (phoneNumber: string) => {
  const result = phoneNumber.replace(/\D/g, '')
  return /0000/.test(result)
}

// export const format = (phoneNumber: string) => {
//   const result = phoneNumber.replace(/\D/g, '')

//   const actual = /^(?:254|254|07|7|01|1)\d{8}$/

//   return /0000/.test(result) || actual.test(result)
// }
/**
 * create a function called humanizeAmounts that formats the amount to a human-readable format.
 * User Intl
 */
export const humanizeAmounts = (amount: number, currency: string = 'KES') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// helper method to get the latest transaction invoiceNumber
export const getLatestFiatTransactionInvoiceNumber = async (
  userId: string,
  username?: string,
  starter: string = 'PUSH',
  isNew: boolean = false,
): Promise<string> => {
  let inv = ''
  if (isNew) {
    inv = `DOLL/${starter}/${(username
      ? username?.slice(0, 4)
      : faker.person.firstName().slice(0, 4)
    ).toUpperCase()}/-000000001`
  }
  const latestTransaction = await prisma.fiatTransaction.findFirst({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!latestTransaction) {
    inv = `DOLL/${starter}/${(username
      ? username?.slice(0, 4)
      : faker.person.firstName().slice(0, 4)
    ).toUpperCase()}/-000000001`
  }

  inv = latestTransaction?.invoiceNumber!

  return inv
}
/**
 * generateInvoiceNumber generates a random invoice number.
 * @returns
 */
export const generateInvoiceNumber = (): string => {
  const randomNum = randomBytes(4).toString('hex')
  return `INV-${randomNum}`
}

export const generateReferralLink = (host: string, userId: string): string => {
  const randomNum = `rf` + randomBytes(6).toString('hex')
  return `${host}-${randomNum}-${userId}`
}

export const generateApiKey = (length: number = 32): string => {
  const randomBuffer = randomBytes(length)

  const apiKey = randomBuffer.toString('hex').slice(0, length)

  return `DOLLAR-APP-RATES-APIKEY-${apiKey}`
}

export const formatNumber = (number: number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

// export const sendSMS = async (opts: { phone: string; message: string }) => {
//   const twillio_sid = process.env.TWILIO_ACCOUNT_SID!
//   const twillio_token = process.env.TWILIO_ACCOUNT_AUTH_TOKEN!
//   const from = process.env.TWILIO_PHONE_NUMBER!

//   const client = twilio(twillio_sid, twillio_token)

//   const message = {
//     body: opts.message,
//     to: opts.phone,
//     // messagingServiceSid: 'MG00cf08f9101b2efbb5fb5c1c55de4790',
//     from: from,
//   }

//   console.log('Message: ', message)
//   const resp: any = await client.messages.create(message)

//   console.log(resp)
//   return resp
// }

export const sendSMS = async (opts: { message: string; phone: string }) => {
  const FROM = 'NGENI'
  const AFRICA_TALKING_NOW_USERNAME = process.env.AFRICA_TALKING_NOW_USERNAME!
  const AFRICA_TALKING_NOW_KEY = process.env.AFRICA_TALKING_NOW_KEY!
  let phoneNumbers: string[] = [opts.phone]

  const africastalking = new Client({
    apiKey: AFRICA_TALKING_NOW_KEY!,
    username: AFRICA_TALKING_NOW_USERNAME!,
  })
  // ensure phoneNumbers has + prefix
  phoneNumbers = phoneNumbers.map((phone) =>
    phone.startsWith('+') ? phone : `+${phone}`,
  )

  const options = {
    to: phoneNumbers,
    from: FROM,
    message: opts.message,
  }
  const res = await africastalking.sendSms(options)
  return res
}

const MAX_DECIMALS = 18

export const roundToMaxDecimals =  (
  amount:  number,
  maxDecimals: number = MAX_DECIMALS,
): string => {
  return Number(amount).toFixed(maxDecimals).toString()
}
