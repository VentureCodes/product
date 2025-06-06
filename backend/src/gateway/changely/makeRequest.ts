import axios from 'axios'
import { authenticate } from './auth'

export const makeRequest = async (opts: {
  url: string
  data: object
  method: string
  privateKey: string
}) => {
  try {
    const setup = authenticate(opts.privateKey, opts.data)
    const response = await axios({
      url: opts.url,
      method: opts.method,
      data: setup.message,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': setup.publicKey,
        'X-Api-Signature': setup.signature,
      },
    })

    return response.data
  } catch (error) {
    console.error(error)
    return error
  }
}
