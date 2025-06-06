import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import process from 'process'
import { app, httpServer } from './app'
import { checkEnv } from './check-env'
import { Context, schema } from './graphql'
import { getUser } from './graphql/helper/auth'
import { generateSession } from './utils/mam-laka/session'
import { cachedAssetPrices } from './utils/coinMarketCap'
// import { monitorBsc } from './scans'
import { Monitor } from './monitor/pnl/monitor-pnl'

const Main = async () => {
  checkEnv()

  const server = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  const prisma = new PrismaClient()

  const mamlakaSession = {
    session: (await generateSession(prisma)) || '',
    expiresAt: new Date(),
  }

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        mamlakaSession,
        prisma,
        res,
        user: getUser(req),
      }),
    }),
  )


  // try {
  //   monitorBsc()
  // } catch (error: any) {
  //   console.log('Error monitoring BSC', error.message)
  // }

  //Get Price of all assets
  cachedAssetPrices()
  // schedularEvents()

  // byBitPositionMonitoring()

  await Monitor(
    process.env.BYBIT_API_KEY as string,
    process.env.BYBIT_API_SECRET as string,
    '',
  )

  const port = process.env.PORT || 4000
  const devTunnel = process.env.DEV_TUNNEL || ''

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))

  console.info(`---\n🚀 Server ready at: http://localhost:${port}/graphql`)
  console.info(`Public URL (Dev Tunnel): ${devTunnel}/graphql`)
}

Main().catch((err) => {
  console.error('Error starting server\n---\n', err?.message || err, '\n---')
})