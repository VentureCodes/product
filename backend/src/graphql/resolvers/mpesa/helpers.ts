// HELPERS FOR MPESA RESOLVERS
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { Request, Response, Router } from 'express'

const router = Router()

export interface CallbackItem {
  Name: string
  Value: string
}



export const getItemValue = (
  items: CallbackItem[],
  name: string,
): string | number | undefined => {
  const item = items.find((item) => item.Name === name)
  return item ? item.Value : undefined
}

export const formatMpesaNumber = (phone: string): string => {
  if (!phone) {
    return 'Invalid phone number: undefined or null value received.'
  }
  // Remove any non-digit characters
  const cleanNumber = phone.replace(/[^\d]/g, '')

  // Check if the number starts with a leading zero, and remove it
  const formattedNumber = cleanNumber.startsWith('0')
    ? cleanNumber.slice(1)
    : cleanNumber

  // Add the country code if missing
  return formattedNumber.startsWith('254')
    ? `${formattedNumber}`
    : `254${formattedNumber}`
}

// AUTH TOKEN
export const generateAuthToken = async () => {
  const consumerKey = process.env.CONSUMER_KEY
  const consumerSecret = process.env.CONSUMER_SECRET
  console.log(
    'Consumer Key: ',
    consumerKey,
    'Consumer Secret: ',
    consumerSecret,
  )

  const basicAuth = `Basic ${Buffer.from(
    `${consumerKey}:${consumerSecret}`,
    'utf8',
  ).toString('base64')}`
  const url = process.env.AUTH2TOKEN_URL

  if (!consumerKey || !consumerSecret || !url) {
    throw new Error('Missing MPESA Consumer Key, Consumer Secret or Auth URL')
  }

  try {
    const response = await axios.get(url!, {
      headers: {
        Authorization: basicAuth,
        'Content-Type': 'application/json',
      },
      params: { grant_type: 'client_credentials' },
    })
    console.log('MPESA Auth Token: ', url, response.data)

    return response.data
  } catch (error) {
    console.log('Error Generating MPESA Auth Token', error)
    return error
  }
}

export const generatePassword = () => {
  const businessShortCode = process.env.SHORTCODE
  const passKey = process.env.PASSKEY

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3)
  const password = Buffer.from(
    `${businessShortCode}${passKey}${timestamp}`,
    'utf8',
  ).toString('base64')

  return { password, timestamp }
}

export const generateSecurityCredential = () => {
  const filePath = path.join(__dirname, 'ProductionCertificate.cer')
  const publicKey = fs.readFileSync(`${filePath}`, 'utf8')

  const initiatorPwd = Buffer.from(process.env.B2C_INITIATOR_PASSWORD!)

  const securityCredential = crypto
    .publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      new Uint8Array(initiatorPwd),
    )
    .toString('base64')
  // console.log("Security Credential: ", securityCredential);
  return securityCredential
}

// TEST AUTH TOKENS
const testMpesaAuth = async (req: Request, res: Response) => {
  try {
    console.log('Testing Mpesa Auth', req.body)
    const authToken = await generateAuthToken()
    // const pwd = await generatePassword();
    // const securityCredential = await generateSecurityCredential()

    res.status(200).json({
      success: true,
      message: '[AUTHORIZATION]: Mpesa Auth Generated Successfully',
      token: authToken,
      // password: pwd,
      // secCred: securityCredential
    })
  } catch (error) {
    console.log('Error Testing Mpesa Auth: ', error)
    res.status(500).json({
      success: false,
      message: '[AUTHORIZATION]: Error Testing Mpesa Auth',
      error: error,
    })
  }
}

router.get('/testMpesaAuth', testMpesaAuth)

export { router as testMpesaAuthRouter }
