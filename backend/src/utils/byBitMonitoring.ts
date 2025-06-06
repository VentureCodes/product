import { Monitor } from '../monitor/pnl/monitor-pnl'
import { prisma } from '../graphql/context'
import NodeCron from 'node-cron'

// A Map to keep track of monitored trades
const monitoredTrades = new Map<string, boolean>()

export const byBitPositionMonitoring = () => {
  // node cron to run every 30 seconds to get allowed token prices
  NodeCron.schedule('*/30 * * * * *', async () => {
    console.log('Running cron job to monitor trade positions')

    const trades = await prisma.tradeInformation.findMany({
      where: {
        status: {
          not: 'closed',
        },
      },
      select: { bybitOrderId: true },
    })

    console.log({ trades })

    for (const trade of trades) {
      // Skip monitoring if the trade is already being monitored
      if (monitoredTrades.has(trade.bybitOrderId as string)) {
        console.log(
          `Trade ${trade.bybitOrderId} is already being monitored. Skipping...`,
        )
        continue
      }

      try {
        // Mark the trade as being monitored
        monitoredTrades.set(trade.bybitOrderId as string, true)

        // Call the Monitor function to process the trade
        await Monitor(
          process.env.BYBIT_API_KEY as string,
          process.env.BYBIT_API_SECRET as string,
          '',
        )

        console.log(`Started monitoring trade ${trade.bybitOrderId}`)
      } catch (error) {
        console.error(`Error monitoring trade ${trade.bybitOrderId}:`, error)
        // Remove trade from monitored map in case of an error to allow retry
        monitoredTrades.delete(trade.bybitOrderId as string)
      }
    }
  })
}
