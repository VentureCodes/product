import {
  Trade,
  CopyTrade,
  TransactionStatus,
  CopyStatus,
  User,
} from '@prisma/client'
import { prisma } from '../context'
import { TradingService } from '../../utils/place-order'
import { Notification } from '../../utils/notification'
import { walletWithProvider } from '../../utils/erc-wallet'

const tradingService = new TradingService(
  process.env.BYBIT_API_KEY as string,
  process.env.BYBIT_API_SECRET as string,
)

async function validateUserFunds(
  copyTrade: CopyTrade,
  requiredAmount: number,
  token: string,
): Promise<{ isValid: boolean; wallet?: any; error?: string }> {
  try {
    // Get user's crypto wallet
    const cryptoWallet = await prisma.cryptoWallet.findFirst({
      where: { userId: copyTrade.userId },
    })

    if (!cryptoWallet) {
      return { isValid: false, error: 'Crypto wallet not found' }
    }

    // Initialize wallet provider
    const testnet = process.env.BLOCKCHAIN_NETWORK === 'testnet'
    const { ercWrapper, wallet } = await walletWithProvider(
      testnet,
      cryptoWallet.mnemonic,
    )

    if (!wallet || !ercWrapper) {
      return { isValid: false, error: 'Failed to initialize wallet' }
    }

    // Check balance
    const balance = await ercWrapper.getTokenBalance(token)    
    if (parseFloat(balance) < requiredAmount) {
      return { isValid: false, error: 'Insufficient balance' }
    }

    return { isValid: true, wallet: { ercWrapper, wallet } }
  } catch (error) {
    console.error('Error validating funds:', error)
    return { isValid: false, error: 'Error validating funds' }
  }
}

async function PlacingTrades(trade: Trade) {
  try {
    // Get all pending copy trades for this trader
    const copyTrades = await prisma.copyTrade.findMany({
      where: {
        shillId: trade.shillId as string,
        status: CopyStatus.Pending,
      },
      include: {
        user: true,
      },
    })

    if (!copyTrades.length) {
      console.log('No pending copy trades found')
      return
    }

    // Filter eligible users by validating funds and transferring them
    const eligibleUsers: {
      user: User
      copyTrade: CopyTrade
      transferredAmount: number
    }[] = []

    for (const copyTrade of copyTrades) {
      const requiredAmount =
        Number(copyTrade.amount) * Number(copyTrade.leverage)

      const validation = await validateUserFunds(
        copyTrade,
        requiredAmount,
        '0x55d398326f99059ff775485246999027b3197955',
      )
      console.log({ validation })

      if (!validation.isValid) {
        // Notify user about insufficient funds
        await new Notification(
          copyTrade.userId,
          '',
          'Trade Placement Failed',
          {
            message: `Your trade could not be placed due to insufficient funds. Required: ${requiredAmount}`,
          },
          'Unread',
          'Trade',
          'InApp',
        ).sendInAppNotification()

        await new Notification(
          copyTrade.userId,
          '',
          'Trade Placement Failed',
          {
            message: `Your trade could not be placed due to insufficient funds. Required: ${requiredAmount}`,
          },
          'Sent',
          'Trade',
          'Email',
        ).sendEmailNotification()

        // Update copy trade status
        await prisma.copyTrade.update({
          where: { id: copyTrade.id },
          data: { status: CopyStatus.Failed },
        })

        continue
      }

      const { ercWrapper, wallet } = validation.wallet

      // Transfer funds to trading vault
      const transferResult = await ercWrapper.send(
        process.env.COPY_TRADER_WALLET_ADDRESS as string,
        requiredAmount.toString(),
        '0x55d398326f99059ff775485246999027b3197955', //TODO: Update to usdt address
        process.env.BLOCKCHAIN_NETWORK === 'testnet',
      )

      if (transferResult.status === 'success') {
        eligibleUsers.push({
          user: copyTrade.user,
          copyTrade,
          transferredAmount: requiredAmount,
        })

        await prisma.cryptoTransaction.create({
          data: {
            userId: copyTrade.userId,
            hash: transferResult.transaction?.hash || '',
            blockNumber:
              transferResult.transaction?.blockNumber?.toString() || '',
            timeStamp: new Date().toISOString(),
            from: wallet.address,
            to: process.env.COPY_TRADER_WALLET_ADDRESS as string,
            value: requiredAmount,
            gas: transferResult.transaction?.gasLimit?.toString() || '',
            gasPrice: transferResult.transaction?.gasPrice?.toString() || '',
            status: TransactionStatus.Completed,
            type: 'CopyTrade',
            tokenSymbol: 'BSC-USD',
          },
        })
      } else {
        // Notify user about transfer failure
        await new Notification(
          copyTrade.userId,
          '',
          'Trade Placement Failed',
          {
            message: `Your trade could not be placed due to a fund transfer error.`,
          },
          'Unread',
          'Trade',
          'InApp',
        ).sendInAppNotification()

        // Update copy trade status
        await prisma.copyTrade.update({
          where: { id: copyTrade.id },
          data: { status: CopyStatus.Failed },
        })
      }
    }

    // Sum up all transferred amounts for the batch trade
    const totalTradeAmount = eligibleUsers.reduce(
      (sum, user) => sum + user.transferredAmount,
      0,
    )

    if (totalTradeAmount > 0) {
      // Place a single trade order for the batch
      const tradeResult = await tradingService.placeOrder(
        trade,
        totalTradeAmount,
      )

      if (tradeResult.success) {
        // Update each eligible user's trade status to 'Ongoing'
        // create a trade information record
        await prisma.$transaction(
          async (tx) => {
            const tradeInfo = await tx.tradeInformation.create({
              data: {
                bybitOrderId: tradeResult.orderId!,
                unrealizedProfit: 0,
                realizedProfit: 0,
                totalInvestment: totalTradeAmount,
                totalReturn: 0,
                pnl: 0,
                status: 'pending',
                side: trade.tradeSignal,
                orderType: 'Limit',
                stopLoss: trade.stopLoss,
                takeProfit: trade.takeProfit,
                quantity: parseFloat(tradeResult?.details?.quantity || '0'),
                trade: { connect: { id: trade.id } },
                
              },
            })

            for (const { copyTrade, user } of eligibleUsers) {
              await tx.copyTrade.update({
                where: { id: copyTrade.id },
                data: {
                  status: CopyStatus.Ongoing,
                  TradeInformation: { connect: { id: tradeInfo.id } },
                },
              })

              // Notify user about successful transfer
              new Notification(
                copyTrade.userId,
                '',
                'Trade Copied Successfully',
                {
                  message: `Your trade has been successfully placed on ${
                    trade.token
                  }.\n
                  You bought in at ${trade.entryPrice}, Leverage ratio: ${
                    copyTrade.leverage
                  }x with ${
                    copyTrade.amount
                  } USDT at ${new Date().toLocaleString('en-GB', {
                    timeZone: user?.timezone || 'Africa/Nairobi',
                  })}.\n
                  Happy trading!
                `,
                  additionalData: { copyTradeId: copyTrade.id },
                },
                'Unread',
                'Trade',
                'InApp',
              ).sendInAppNotification()

              new Notification(
                copyTrade.userId,
                '',
                'Trade Copied Successfully',
                {
                  message: `Your trade has been successfully placed on ${
                    trade.token
                  }.\n
                  You bought in at ${trade.entryPrice}, Leverage ratio: ${
                    copyTrade.leverage
                  }x with ${
                    copyTrade.amount
                  } USDT at ${new Date().toLocaleString('en-GB', {
                    timeZone: user?.timezone || 'Africa/Nairobi',
                  })}.\n
                  Happy trading!
                `,
                  additionalData: { copyTradeId: copyTrade.id },
                },
                'Sent',
                'Trade',
                'Email',
              ).sendEmailNotification()
            }
          },
          {
            maxWait: 10000,
            timeout: 20000,
          },
        )

        const successMsg = `🎯 Batch trade placed successfully!\n
          Copy Trades: ${eligibleUsers.length}\n
          All Copy Trades ID: ${eligibleUsers
            .map((user) => user.copyTrade.id)
            .join(', ')}\n
          Symbol: ${trade.token}\n
          Side: ${trade.tradeSignal}\n
          Amount: ${totalTradeAmount}\n
          Entry Price: ${trade.entryPrice}\n
          Take Profit: ${trade.takeProfit}\n
          Stop Loss: ${trade.stopLoss}\n
          ByBit Order ID: ${tradeResult.orderId}`

        await notifyCashiers(successMsg)

        console.log('Batch trade placed successfully.')
      } else {
        console.error('Failed to place batch trade:', tradeResult.message)
        //TODO: Update eligible copy trades to a special status so that it can be retried on next signal without deducting user's balance
        await Promise.all(
          eligibleUsers.map(({ copyTrade }) =>
            prisma.copyTrade.update({
              where: { id: copyTrade.id },
              data: { status: CopyStatus.Failed },
            }),
          ),
        )
      }
    } else {
      console.log('No eligible users for batch trade.')
    }
  } catch (error) {
    console.error('Error in PlacingTrades:', error)
    throw error
  }
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
        'Trade Placement Summary',
        { message },
        'Unread',
        'Trade',
        'InApp',
      ).sendInAppNotification(),
      new Notification(
        user.id,
        '',
        'Trade Placement Summary',
        { message },
        'Unread',
        'Trade',
        'Telegram',
      ).sendTelegramNotification(),
    ]),
  )
}

export default PlacingTrades
