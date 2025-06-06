import { TransactionStatus } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { prisma } from '../graphql/context'
import { sendSMS } from '../utils'
import generateQRCodeWithLogo from '../utils/generateQrCode'
import { sendTgMsg } from '../utils/sms'

const router = Router()

router.post('/mamlaka/callback', async (req: Request, res: Response) => {
  console.log('Mamlaka callback', req.body)

  const {
    transactionStatus,
    netAmount,
    secureId: paymentSecureId,
    externalId: id,
    currency: symbol,
  } = req.body

  if (transactionStatus === 'COMPLETED') {
    let transaction = await prisma.transaction.update({
      where: {
        id,
        paymentSecureId,
        fiat: {
          symbol,
        },
      },
      include: {
        ad: {
          select: {
            advertiser: {
              select: {
                phone: true,
                id: true,
              },
            },
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            id: true,
          },
        },
        coin: {
          select: {
            symbol: true,
          },
        },
      },
      data: {
        amountReceived: parseFloat(netAmount),
        note: `Payment of ${netAmount} ${symbol} received by receiver`,
      },
    })

    await prisma.fiatWallet.update({
      where: {
        fiatWalletId: {
          userId: transaction.ad.advertiser.id,
          fiatId: transaction.fiatId,
        },
      },
      data: {
        balance: {
          increment: parseFloat(netAmount),
        },
      },
    })

    let name =
      `${transaction.receiver.firstName} ${transaction.receiver.lastName}`.trim()

    const cryptoWallet = await prisma.cryptoWallet.findFirst({
      where: {
        userId: transaction.receiver.id,
      },
    })

    if (cryptoWallet) {
      const cryptoAccount = await prisma.cryptoAccount.findFirst({
        where: { cryptoWalletId: cryptoWallet.id },
      })

      name = name || transaction.receiver.phone!

      const message = `${name} has sent you ${symbol}. ${netAmount}. Please send ${transaction.quantity} of ${transaction.coin.symbol} to complete the transaction. User Wallet: ${cryptoAccount?.address}`

      if (cryptoAccount?.address) {
        const imageGenerated = await generateQRCodeWithLogo({
          walletAddress: cryptoAccount.address,
          logoPath: 'https://www.dollarapp.me/logo.svg',
        })
        await sendTgMsg(
          message,
          imageGenerated,
        )
      }

      let smsResponse = await sendSMS({
        phone: `+${transaction.ad.advertiser.phone}`,
        message,
      })

      // await sendSMS(
      //   process.env.AFRICA_TALKING_NOW_KEY!,
      //   process.env.AFRICA_TALKING_NOW_USERNAME!,
      //   [transaction.ad.advertiser.phone],
      //   message,
      // )

      console.log({ smsResponse })
    }
  }

  if (transactionStatus === 'FAILED') {
    let transaction = await prisma.transaction.update({
      where: {
        id,
        paymentSecureId,
        fiat: {
          symbol,
        },
      },
      data: {
        status: TransactionStatus.Failed,
        note: `Payment of ${netAmount} ${symbol} failed`,
      },
    })

    console.log('Transaction updated', transaction)
  }

  res.send('OK')
})

export { router as Ip2MamlakaCallBackRouter }
