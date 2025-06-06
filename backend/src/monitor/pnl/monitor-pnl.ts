import { ClosedPnLV5, RestClientV5, WebsocketClient } from 'bybit-api'
import { prisma } from '../../graphql/context'
import { reportPositions, reportPnl } from './report-pnl'
import { Notification } from '../../utils/notification'

interface PositionUpdate {
  symbol: string
  side: string
  size: string
  entryPrice: string
  unrealisedPnl: string
  cumRealisedPnl: string
  positionValue: string
  takeProfit: string
  stopLoss: string
  avgEntryPrice: string
}

const savedTrades: Record<string, any> = {}

export const Monitor = async (
  key: string,
  secret: string,
  accountName = 'trap2',
) => {
  const client = new RestClientV5({ key, secret })
  const ws = new WebsocketClient({ key, secret, market: 'v5' })

  await ws
    .subscribeV5(['position'], 'linear')
    .catch((err) =>
      notifyCashiers(`Subscription failed for ${accountName}: ${err}`),
    )

  ws.on('update', async (data: { topic: string; data: PositionUpdate[] }) => {
    if (data.topic !== 'position') return
    for (const update of data.data) {
      await handlePositionUpdate(update, client)
    }
  })

  const MAX_RETRIES = 3
  const RETRY_DELAY = 5000

  async function safePrismaTransaction(fn: () => any, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt < retries) {
          console.error(
            `Transaction failed. Retrying attempt ${attempt}...`,
            error,
          )
          await new Promise((res) => setTimeout(res, RETRY_DELAY))
        } else {
          console.error('Transaction failed after max retries:', error)
          throw error
        }
      }
    }
  }

  const handlePositionUpdate = async (
    update: PositionUpdate,
    client: RestClientV5,
  ) => {
    const symbol = update.symbol
    const status = Number(update.size) > 0 ? 'active' : 'closed'

    const existingIds = await prisma.tradeInformation.findMany({
      where: { trade: { token: symbol } },
      select: { id: true },
    })
    console.log('Existing IDs:', existingIds)

    if (status === 'active') {
      let matchedTrade: { id: string; tradeId: string } | null = null

      while (!matchedTrade) {
        const openTrades = await safePrismaTransaction(() =>
          prisma.tradeInformation.findMany({
            where: {
              status: { not: 'closed' },
              trade: { token: symbol },
            },
            include: {
              trade: {
                select: {
                  entryPrice: true,
                  takeProfit: true,
                  token: true,
                },
              },
            },
          }),
        )
        console.log('Open Trades:', openTrades, 'update', update)

        // Find the matched trade
        matchedTrade = openTrades.find(
          (trade: { trade: { takeProfit: any; token: string } }) =>
            Number(trade.trade.takeProfit) === Number(update.takeProfit) &&
            trade.trade.token === symbol,
        )

        if (!matchedTrade) {
          console.log('No matched trade found for:', symbol, 'retrying...')
          await new Promise((resolve) => setTimeout(resolve, 5000))
          continue
        }

        savedTrades[symbol] = matchedTrade
        console.log('Update Data:', update)
        console.log('Updating TradeInformation with ID:', matchedTrade.id)

        try {
          await safePrismaTransaction(() =>
            prisma.tradeInformation.update({
              where: { id: matchedTrade!.id },
              data: {
                status,
                unrealizedProfit: Number(update.unrealisedPnl),
                currentPrice: Number(update.entryPrice),
                cumEntryValue: Number(update.positionValue),
                avgEntryPrice: Number(update.entryPrice),
                takeProfit: Number(update.takeProfit),
                stopLoss: Number(update.stopLoss),
                updatedAt: new Date(),
              },
            }),
          )
        } catch (error) {
          console.error(
            `TradeInformation with ID ${matchedTrade?.id} not found for update.`,
            error,
          )
        }

        await reportPositions(
          Number(update.unrealisedPnl),
          await prisma.copyTrade.findMany({
            where: { TradeInformationId: matchedTrade.id },
            include: {
              user: true,
            },
          }),
          15,
        )

        // Start periodic updates for active trades
        setPeriodicUpdate(client, matchedTrade.id, matchedTrade.tradeId, symbol)
      }
    } else if (status === 'closed' && savedTrades[symbol]) {
      console.log('Saved Trades:', savedTrades[symbol])

      let closedData: Record<string, any> | ClosedPnLV5 | null = null

      // Loop until closedData is available
      while (!closedData) {
        const closedPosition = await client.getClosedPnL({
          category: 'linear',
          symbol: symbol,
        })
        console.log({
          closedPosition,
          closedTrade: savedTrades[symbol],
          symbol,
        })

        closedData = closedPosition.result.list[0] ?? null

        // If closedData is found, proceed with the logic
        if (!closedData) {
          console.log(`Closed data for ${symbol} is not available, retrying...`)
          await new Promise((resolve) => setTimeout(resolve, 5000))
          continue
        }

        const closedTrade = savedTrades[symbol]

        if (!closedTrade) {
          console.error(`❌ closedTrade is undefined! Cannot update database.`)
          console.log("closedPosition.result.list:", closedPosition.result.list)
          return
        }

        const tradeInfo = await safePrismaTransaction(async () =>
          prisma.tradeInformation.update({
            where: { id: closedTrade.id },
            data: {
              status,
              closedPnl: Number(closedData!.closedPnl || 0),
              realizedProfit: Number(closedData!!.closedPnl || 0),
              cumEntryValue: Number(closedData!.cumEntryValue),
              avgEntryPrice: Number(closedData!.avgEntryPrice),
              currentPrice: Number(closedData!.avgExitPrice),
              avgExitPrice: Number(closedData!.avgExitPrice),
              pnl: await calculatePercentageChange(
                Number(closedData!.closedPnl),
                Number(closedData!.closedSize),
                Number(closedData!.avgEntryPrice),
              ),
              closedSize: Number(closedData!.closedSize),
              updatedAt: new Date(Number(closedData!.updatedTime)),
            },
            select: {
              id: true,
              trade: {
                select: { entryPrice: true },
              },
            },
          }),
        )

        console.log({ update2: tradeInfo })

        await reportPnl(symbol, closedTrade.bybitOrderId, tradeInfo, closedData)
        // Ensure we remove the trade from savedTrades
        console.log(`Removing ${symbol} from savedTrades...`)
        delete savedTrades[symbol] // ✅ REMOVE FROM savedTrades

        console.log(`Removed ${symbol} from savedTrades.`)
      }
    }
  }

  const setPeriodicUpdate = (
    client: RestClientV5,
    tradeInfoId: string,
    tradeId: string,
    symbol: string,
  ) => {
    console.log({ tradeInfoId })
    console.log(`Starting Kline updates for ${symbol}`)
    const updateInterval = 15 * 1000 // 2 minutes in milliseconds
    const updateTradeInformation = async () => {
      try {
        if (!savedTrades[symbol]) {
          console.log(`Stopping updates for ${symbol} as trade is closed.`)
          return // Exit the loop
        }
        console.log(`Fetching position info for ${symbol}...`)
        const positionInfo = await client.getPositionInfo({
          category: 'linear',
          symbol: symbol,
        })

        const positionData = positionInfo?.result?.list[0]

        if (!positionData || Number(positionData.size) === 0) {
          console.log(`No active position for ${symbol}, stopping updates...`)
          delete savedTrades[symbol] // Remove from tracking
          return
        }

        console.log(`Fetching Kline data for ${symbol}...`)
        const klineData = await client.getKline({
          category: 'linear',
          symbol,
          interval: '15',
        })

        const kData = klineData.result.list
        console.log(`Raw Kline data for ${symbol}:`)

        //Flatten the kData
        const flattenedKlineData = kData.flatMap(
          ([
            startTime,
            openPrice,
            highPrice,
            lowPrice,
            closePrice,
            volume,
            turnover,
          ]) => ({
            tradeId,
            startTime,
            openPrice,
            highPrice,
            lowPrice,
            closePrice,
            symbol,
            volume,
            turnover,
          }),
        )
        console.log(`Flattened Kline data for ${symbol}:`)

        if (positionData && flattenedKlineData.length > 0) {
          try {
            await safePrismaTransaction(() =>
              prisma.tradeInformation.update({
                where: { id: tradeInfoId },
                data: {
                  currentPrice: Number(positionData.markPrice),
                  unrealizedProfit: Number(positionData.unrealisedPnl),
                  cumEntryValue: Number(positionData.positionValue),
                  avgEntryPrice: Number(positionData.avgPrice),
                  takeProfit: Number(positionData.takeProfit),
                  stopLoss: Number(positionData.stopLoss),
                  updatedAt: new Date(Number(positionData.updatedTime)),
                },
              }),
            )
            console.log(`Trade information updated successfully for ${symbol}.`)

            console.log(`Creating new Kline data for ${symbol}...`)
            await safePrismaTransaction(() =>
              prisma.klineData.createMany({
                data: flattenedKlineData,
              }),
            )
            console.log(
              'Transaction for trade ${tradeInfoId} executed successfully.Trade and Kline data updated successfully',
            )
            console.log(`Kline data created successfully for ${symbol}.`)

            console.log('Trade Information updated successfully')

            // Query created Kline data and update the symbol field
            console.log(`Fetching existing Kline data for ${symbol}...`)
            // const existingKlineData = await prisma.klineData.findMany({
            //   where: { symbol, tradeId },
            // })

            console.log(`Existing Kline data for ${symbol}:`)

            // if (existingKlineData.length > 0) {
            //   console.log(`Updating existing Kline data for ${symbol}...`)
            //   const updateResult = await safePrismaTransaction(() =>
            //     prisma.klineData.updateMany({
            //       where: { symbol, tradeId },
            //       data: { tradeId },
            //     }),
            //   )

            //   console.log(`Update result:`)
            //   console.log(
            //     `Updated ${updateResult.count} existing Kline data records successfully for trade ${tradeInfoId} (${symbol}).`,
            //   )
            // } else {
            //   console.log(
            //     `No existing Kline data found for ${symbol} to update.`,
            //   )
            // }
          } catch (error) {
            console.error(
              'Transaction failed for trade ${tradeInfoId}: ${error.message}',
              error,
            )
          }
        } else {
          if (!positionData) {
            console.error(`Position data for ${symbol} not found`)
          }
          if (flattenedKlineData.length === 0) {
            console.error(`Kline data for ${symbol} not found`)
          }
        }
      } catch (error) {
        console.error(`Error updating trade information for ${symbol}`, error)
      }
      setTimeout(updateTradeInformation, updateInterval)
    }

    updateTradeInformation()
  }

  ws.on('error', async (err: { ret_msg?: string }) => {
    const message =
      err?.ret_msg === 'Your api key has expired'
        ? `API key expired for ${accountName}`
        : `WebSocket error for ${accountName}`
    await notifyCashiers(message)
  })
}

async function notifyCashiers(message: string) {
  const cashiers = await prisma.user.findMany({
    where: { userType: 'CASHIER' },
    select: { id: true },
  })

  await Promise.all(
    cashiers.flatMap((user) => [
      new Notification(
        user.id,
        '',
        'Trade Position',
        { message },
        'Unread',
        'Trade',
        'InApp',
      ).sendInAppNotification(),
      new Notification(
        user.id,
        '',
        'Trade Position',
        { message },
        'Sent',
        'Trade',
        'Telegram',
      ).sendTelegramNotification(),
    ]),
  )
}

const calculatePercentageChange = async (
  pnl: number,
  size: number,
  entryPrice: number,
) => {
  if (
    entryPrice === 0 ||
    size === 0 ||
    isNaN(entryPrice) ||
    isNaN(size) ||
    isNaN(pnl)
  ) {
    return 0
  }
  return roundToSignificantDigits((pnl / (size * entryPrice)) * 100, 2)
}

const roundToSignificantDigits = (num: number, digits: number) => {
  if (num === 0) return 0
  const scale = Math.pow(10, digits - Math.floor(Math.log10(Math.abs(num))) - 1)
  return Math.round(num * scale) / scale
}

