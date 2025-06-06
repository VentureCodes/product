import axios from 'axios'
import express, { Request, Response, NextFunction } from 'express'
import { generateAuthToken } from './helpers'

const router = express.Router()

router.post(
  '/mps/register-url',
  async (req: Request, res: Response, next: NextFunction) => {
    const url = process.env.MPESA_REGISTER_URL
    console.log('Register Url host: ', req.headers.host, 'Url: ', req.body.url)

    if (!url) {
      res.status(500).json({
        message: 'MPESA Register URL is missing',
      })
      next()
    }
    const AuthToken = await generateAuthToken()
    const payload = {
      ShortCode: process.env.SHORTCODE,
      ResponseType: 'Completed',
      ConfirmationURL: `https://api.dollarapp.me/mps/confirmation`,
      ValidationURL: `https://api.dollarapp.me/mps/validation`,
    }

    const response = await axios.post(url!, payload, {
      headers: {
        Authorization: `Bearer ${AuthToken.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Register Url Response: ', response.data)
    res.status(200).json({ data: response.data })
  },
)

export { router as registerUrlRouter }
