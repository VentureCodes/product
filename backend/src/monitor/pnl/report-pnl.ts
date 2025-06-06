import { prisma } from '../../graphql/context'
import { Notification } from '../../utils/notification'
import { CopyStatus, OrderSide, TransactionStatus } from '@prisma/client'
import { createPNLImage } from '../../utils/pnl-image'
import { walletWithPrivateKey } from '../../utils/erc-wallet'

const reportPnl = async (
  symbol: string,
  _orderId: string,
  tradeInfo: any,
  latestOrder: Record<string, any>,
) => {

  //Fetch the orderside from tradeInfo 
  const orderSide: OrderSide = tradeInfo?.side === 'Buy' ? OrderSide.Buy : OrderSide.Sell

  await prisma.copyTrade.updateMany({
    where: {
      TradeInformationId: tradeInfo.id,
    },
    data: {
      status: CopyStatus.Completed,
    },
  })

  const copyTrades = await prisma.copyTrade.findMany({
    where: {
      TradeInformationId: tradeInfo.id,
    },
    select: {
      id: true,
      userId: true,
      leverage: true,
      amount: true,

      createdAt: true,
      user: {
        select: {
          timezone: true,
          username: true,
          cryptoWallet: {
            select: {
              accounts: {
                select: {
                  address: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const distribution = await calculatePNLDistribution(
    latestOrder.closedPnl,
    copyTrades,
    15,
  )

  for (const dist of distribution) {
    await prisma.copyTrade.updateMany({
      where: {
        id: dist.id,
        userId: dist.userId,
        TradeInformationId: tradeInfo.id,
      },
      data: {
        closedPnl: dist.userPnl,
        netReturn: dist.userShare,
        status: CopyStatus.Completed,
      },
    })

    console.log({ dist })

    const userMsg = `Your trade has been successfully closed on ${symbol}.
        \n\n You bought in at ${tradeInfo?.trade?.entryPrice} and sold at ${
      latestOrder.avgExitPrice
    } at ${new Date().toLocaleString('en-GB', {
      timeZone: dist?.copyTrade?.user?.timezone || 'Africa/Nairobi',
    })}.
        \n\n Your profit/loss is ${dist.userPnl}.
        `
    new Notification(
      dist.userId,
      '',
      'Trade Position Closed',
      { message: userMsg, additionalData: { copyTradeId: dist.id } },
      'Unread',
      'Trade',
      'InApp',
    ).sendInAppNotification()

    new Notification(
      dist.userId,
      '',
      'Trade Position Closed',
      { message: userMsg, additionalData: { copyTradeId: dist.id } },
      'Sent',
      'Trade',
      'Email',
    ).sendEmailNotification()

    // Create PNL image
    const pnlImage = await createPNLImage({
      pair: symbol,
      appName: 'DollarApp',
      footer: 'Invite a friend to join and get some amazing rewards!',
      code: dist.user?.username || 'DollarApp',
      percentage: `${Number(dist?.pnlPercentage)?.toFixed(2)}%`,
      time: (() => {
        const createdAt = new Date(dist?.createdAt)
        const now = new Date()

        // Calculate the difference in milliseconds
        const diffInMs = now.getTime() - createdAt.getTime()

        // Convert milliseconds to hours and minutes
        const diffInMinutes = Math.floor(diffInMs / 1000 / 60)
        const hours = Math.floor(diffInMinutes / 60)
        const minutes = diffInMinutes % 60

        // Format the time as "Xh Ym"
        return `${hours}h ${minutes}m`
      })(),
      entryPrice: tradeInfo?.trade?.entryPrice,
      exitPrice: latestOrder.avgExitPrice,
      leverage: dist?.leverage,
      side: orderSide,
    })

    if (pnlImage) {
      await prisma.copyTrade.updateMany({
        where: {
          id: dist.id,
          userId: dist.userId,
          TradeInformationId: tradeInfo.id,
        },
        data: {
          image: pnlImage?.url,
        },
      })
    }

    try {
      const disbursementPrivateKey =
        process.env.DISBURSEMENT_WALLET_PRIVATE_KEY!

      if (!disbursementPrivateKey) {
        throw new Error('DISBURSEMENT_PRIVATE_KEY is not set')
      }

      const testnet = process.env.BLOCKCHAIN_NETWORK === 'testnet'

      // Initialize wallet and provider for the copy trader wallet
      const { ercWrapper, wallet } = await walletWithPrivateKey(
        testnet,
        disbursementPrivateKey,
      )

      if (!wallet || !ercWrapper) {
        throw new Error('Failed to initialize disbursment wallet')
      }

      const tokenAddress = '0x55d398326f99059ff775485246999027b3197955' // Binance USD (BUSD)
      const userWalletAddress = dist.user?.cryptoWallet?.accounts?.address

      if (!tokenAddress || !userWalletAddress) {
        console.error(
          `Missing token or user wallet address for user ${dist.userId}`,
        )
        continue
      }

      //If user share is negative, do not send funds
      if (dist.userShare < 0) {
        console.error(`User share is negative for user ${dist.userId}`)
        continue
      }
      // Send funds back to the user
      const transferResult = await ercWrapper.send(
        userWalletAddress,
        dist.userShare.toString(),
        tokenAddress,
        testnet,
      )

      if (transferResult.status !== 'success') {
        //create cryptotransaction
        await prisma.cryptoTransaction.create({
          data: {
            userId: dist.userId,
            hash: transferResult.transaction?.hash || '',
            blockNumber:
              transferResult.transaction?.blockNumber?.toString() || '',
            timeStamp: new Date().toISOString(),
            from: wallet.address,
            to: userWalletAddress,
            value: parseFloat(dist.userShare),
            gas: transferResult.transaction?.gasPrice?.toString() || '',
            gasPrice: transferResult.transaction?.gasPrice?.toString() || '',
            status: TransactionStatus.Completed,
            type: 'CopyTrade',
            tokenSymbol: 'BSC-USD',
          },
        })

        console.error(
          `Failed to transfer funds to user ${dist.userId}:`,
          transferResult.message,
        )
      } else {
        console.log(
          `Funds successfully transferred to user ${dist.userId}:`,
          transferResult.transaction,
        )
      }
    } catch (error) {
      console.error('Failed to transfer funds to user:', error)
    }
  }
}

const reportPositions = async (
  realizedProfit: number,
  copyTrades: any,
  platformFee: number,
) => {
  const distribution = await calculatePNLDistribution(
    realizedProfit,
    copyTrades,
    platformFee,
  )

  for (const dist of distribution) {
    const userMsg = `Your trade is in play.
        \n\n Your profit/loss is ${dist.userPnl}.
        \n\n Your net return is ${dist.userShare}.
        \n\n As at: ${new Date().toLocaleString('en-GB', {
          timeZone: dist.user?.timezone || 'Africa/Nairobi',
        })}
        `
    new Notification(
      dist.userId,
      '',
      'Trade Position',
      { message: userMsg, additionalData: { copyTradeId: dist.id } },
      'Unread',
      'Trade',
      'InApp',
    ).sendInAppNotification()

    new Notification(
      dist.userId,
      '',
      'Trade Position',
      { message: userMsg, additionalData: { copyTradeId: dist.id } },
      'Sent',
      'Trade',
      'Email',
    ).sendEmailNotification()
  }
}

const calculatePNLDistribution = async (
  realizedProfit: number,
  copyTrades: any,
  platformFee: number,
) => {
  // Determine the sign of the realized profit
  const profitSign = Math.sign(realizedProfit) // -1, 0, or 1

  // If the realized profit is zero, return zero distributions
  if (profitSign === 0) {
    return copyTrades.map((trade: any) => ({
      userId: trade.userId,
      userPnl: 0,
      userShare: trade.amount * 0.85,
      user: trade?.user,
    }))
  }

  // 1. Calculate the platform fee: passed in as a percentage
  const platformFeeAmount = realizedProfit * (platformFee / 100)

  // 2. Deduct the platform fee from the realized profit
  const netProfit = realizedProfit - platformFeeAmount

  // 3. Calculate the total exposure of all copy trades, factoring in leverage
  const totalExposure = copyTrades.reduce(
    (acc: number, trade: any) => acc + trade.amount * trade.leverage,
    0,
  )

  // 4. Calculate the share per unit ratio (profit per unit exposure)
  const sharePerUnit = netProfit / totalExposure

  // 5. Calculate each user's share: user share = share per unit * user exposure (amount * leverage)
  const distribution = copyTrades.map((trade: any) => {
    const userExposure = trade.amount * trade.leverage
    const userPnl = sharePerUnit * userExposure
    const userShare = userPnl + trade.amount // NET RETURN
    const pnlPercentage = (userPnl / userExposure) * 100

    return {
      userId: trade.userId,
      userPnl,
      userShare,
      pnlPercentage,
      leverage: trade.leverage,
      user: trade?.user,
      createdAt: trade.createdAt,
    }
  })

  return distribution
}

export { reportPositions, reportPnl }
