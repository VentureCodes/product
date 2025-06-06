import { IncomingMessage } from 'http'
import { verify } from 'jsonwebtoken'
import { IUserPayload } from './../../interfaces/IUserPayload'

export const getUser = (req: IncomingMessage) => {
  const authorization = req.headers.authorization || ''

  try {
    if (!authorization) {
      return undefined
    }

    const token = authorization.replace('Bearer ', '')
    const user = verify(token, process.env.JWT_SECRET!) as IUserPayload

    return user
  } catch (error: any) {
    // console.error('Error', error?.message || error)

    return undefined
  }
}
