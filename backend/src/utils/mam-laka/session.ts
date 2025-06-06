import { getSessionToken } from './http-request'
import { PrismaClient } from '@prisma/client'

export const generateMamlakaSession = async (_prisma: PrismaClient) => {
  console.log('Generating session')

  const baseUrl = process.env.MAM_LAKA_BASE_URL
  const username = process.env.MAM_LAKA_USERNAME
  const password = process.env.MAM_LAKA_PASSWORD

  if (!baseUrl || !username || !password) {
    throw new Error(
      'MAM_LAKA_BASE_URL, MAM_LAKA_USERNAME, and MAM_LAKA_PASSWORD must be set in environment variables',
    )
  }

  const session = await getSessionToken({
    baseUrl,
    username,
    password,
  })

  if (session) {
    return session.accessToken
  }

  // const sessions = await prisma.session.findMany()
  // let sessionToken: string | null = null

  // if (
  //   sessions.length === 0 ||
  //   (sessions.length > 0 && !sessions[0].mamlakaSession)
  // ) {
  //   const session = await getSessionToken({
  //     baseUrl,
  //     username,
  //     password,
  //   })

  //   if (session) {
  //     if (sessions.length === 0) {
  //       await prisma.session.create({
  //         data: {
  //           mamlakaSession: session.accessToken,
  //         },
  //       })
  //     } else {
  //       await prisma.session.update({
  //         where: { id: sessions[0].id },
  //         data: {
  //           mamlakaSession: session.accessToken,
  //         },
  //       })
  //     }
  //     sessionToken = session.accessToken
  //   }
  // } else {
  //   sessionToken = sessions[0].mamlakaSession
  // }

  // console.log('Session generated', sessionToken)
  return ''
}

export const generateSession = async (prisma: PrismaClient) => {
  // on the first save session if any
  // let session = await prisma.session.findFirst()

  // if (session) {
  //   return session.mamlakaSession as string
  // }
  const token = await generateMamlakaSession(prisma)

  return token
}
