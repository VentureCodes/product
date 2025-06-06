import nodemailer from 'nodemailer'
import * as EmailValidator from 'email-validator'

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
})

// Check for necessary environment variables
function validateEnvVariables() {
  if (!process.env.SENDER_EMAIL || !process.env.SENDER_PASSWORD) {
    throw new Error(
      'Missing environment variables: SENDER_EMAIL and SENDER_PASSWORD must be set',
    )
  }
}

export async function sendEmail(to: string, subject: string, message: string) {
  // Validate environment variables before proceeding
  validateEnvVariables()

  // Validate the email format using email validator
  if (!EmailValidator.validate(to)) {
    throw new Error('Invalid email format')
  }

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
    <h1>Welcome to Dollars App</h1>
    <div class="content">
      <p>${message}</p>
      <a href="https://app.dollarsapp.ai/" class="button">Get Started</a>
    </div>
    <div class="footer">
      <p>If you have any questions, feel free to contact us at mailto:support@dollarapp.me</p>
      <p>&copy; 2024 Dollars App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: to,
      subject: subject,
      text: message,
      html: emailHTML,
    })

    console.log('Email sent: %s', info.messageId)
    return info
  } catch (error: any) {
    console.error('Error sending email:', error.message)
    throw error
  }
}

export async function sendOtpEmail(
  to: string,
  subject: string,
  message: string,
  otp: string,
) {
  // Validate environment variables before proceeding
  validateEnvVariables()

  // Validate the email format using email validator
  if (!EmailValidator.validate(to)) {
    throw new Error('Invalid email format')
  }

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
    <h1>Welcome to Dollars App</h1>
    <div class="content">
      <p>${message}</p>
      <a href="https://app.dollarsapp.ai/auth?email=${to}&token=${otp}" class="button">Verify Now</a>
    </div>
    <div class="footer">
      <p>If you have any questions, feel free to contact us at mailto:support@dollarapp.me</p>
      <p>&copy; 2024 Dollars App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: to,
      subject: subject,
      text: message,
      html: emailHTML,
    })

    console.log('Email sent: %s', info.messageId)
    return info
  } catch (error: any) {
    console.error('Error sending email:', error.message)
    throw error
  }
}
