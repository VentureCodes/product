import axios from 'axios'
import https from 'https'
import { MamlakAuthResponse } from './types'

/** httpRequest
 * Create a new axios instance with https agent
 */
export const httpRequest = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
})

/**
 * Get Session Token
 * @returns MamLakAuthResponse |  undefined
 */
export const getSessionToken = async (opts: {
  baseUrl: string
  username: string
  password: string
}): Promise<MamlakAuthResponse | undefined> => {
  const token = Buffer.from(
    `${opts.username}:${opts.password}`,
    'utf8',
  ).toString('base64')
  const url = `${opts.baseUrl}/api`

  try {
    console.log(`Basic Auth: `, token)
    const { data } = await httpRequest.get(url, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    })

    let response = data as MamlakAuthResponse

    let tokeBase64 = Buffer.from(response.accessToken, 'utf8').toString(
      'base64',
    )
    return { ...response, accessToken: tokeBase64 }
  } catch (error) {
    // console.log("Session Token Error: ", error);
    return undefined
  }
}
