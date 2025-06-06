import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import bot from '../utils/bot'

// Array of photo URLs
const photoUrls = [
  'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671122.jpg?size=626&ext=jpg&ga=GA1.1.633058825.1724413706&semt=ais_hybrid',
  'https://img.freepik.com/free-photo/still-life-books-versus-technology_23-2150062920.jpg?ga=GA1.1.633058825.1724413706&semt=ais_hybrid',
  'https://as2.ftcdn.net/v2/jpg/04/85/11/57/1000_F_485115704_r5m27Jo4t8yP0Y7JOQeBfKHphaUAbakB.jpg',
  'https://img.freepik.com/free-vector/hand-drawn-cartoon-dollar-sign-illustration_23-2150982962.jpg?ga=GA1.1.633058825.1724413706&semt=ais_hybrid',
  'https://img.freepik.com/free-photo/top-view-credit-cards-with-lock-bitcoin_23-2148578113.jpg?ga=GA1.1.633058825.1724413706&semt=ais_hybrid',
]

// Function to get a random photo URL
const getRandomPhotoUrl = (): string => {
  const randomIndex = Math.floor(Math.random() * photoUrls.length)
  return photoUrls[randomIndex]
}

const router = Router()

// FIX: Avoid re-creating Prisma Client on each request
const prisma = new PrismaClient()

router.post('/shill/signal', async (req: Request, res: Response) => {
  console.log('Shill signal request received')

  console.log({ message: req.body })

  let message = `**NEW SHILL SIGNAL**\n`
  message += `---\n`
  message += `**Date**: ${req.body.date}\n`
  message += `**Shiller**: ${req.body.shiller}\n`
  message += `**Coin**: ${req.body.coin}\n`
  message += `**Side**: ${req.body.side}\n`
  message += `**Call Price**: ${req.body.call_price}\n`
  message += `**TP**: ${req.body.tp}\n`
  message += `**SL**: ${req.body.sl}\n`
  message += `---\n`

  try {
    await bot.telegram.sendMessage(
      process.env.TELEGRAM_CHAT_ID!,
      message
        // Escape markdown characters
        .replaceAll('_', '\\_')
        .replaceAll('-', '\\-')
        .replaceAll('[', '\\[')
        .replaceAll(']', '\\]')
        .replaceAll('`', '\\`')
        .replaceAll('~', '\\~')
        .replaceAll('>', '\\>')
        .replaceAll('#', '\\#')
        .replaceAll('+', '\\+')
        .replaceAll('.', '\\.'),
      {
        parse_mode: 'MarkdownV2',
      },
    )

    console.log('Message sent')

    res.send('OK')
  } catch (err) {
    console.error(err)
    res.send('Error')
  }
})

router.post('/shill/stats', async (req: Request, res: Response) => {
  console.log('Shill stats request received')
  let shills: Record<string, Record<string, any>> = req.body

  try {
    await Promise.all(
      Object.entries(shills).map(async ([name, shill]) => {
        let {
          tradeCount,
          pnlLoss,
          pnlWin,
          maxLoss,
          maxProfit,
          avgLoss,
          avgProfit,
          gross,
          winCount,
          lossCount,
          lossRate,
          winLossRatio,
          winRate,
          winPercentage,
          total_vol,
          date,
        } = shill

        const stat = await prisma.shill.upsert({
          where: { name },
          update: {
            tradeCount,
            pnlLoss,
            pnlWin,
            maxLoss,
            maxProfit,
            avgLoss,
            avgProfit,
            photo: getRandomPhotoUrl(),
            gross,
            winCount,
            lossCount,
            lossRate,
            winLossRatio,
            winRate,
            winPercentage,
            avgVolume: total_vol,
          },
          create: {
            name,
            tradeCount,
            pnlLoss,
            pnlWin,
            maxLoss,
            photo: getRandomPhotoUrl(),
            maxProfit,
            avgLoss,
            avgProfit,
            gross,
            winCount,
            lossCount,
            lossRate,
            winLossRatio,
            winRate,
            winPercentage,
            avgVolume: total_vol,
            date,
          },
        })

        console.log({ stat })
      }),
    )

    // delete shill where name == nil

    // const elm = await prisma.shill.delete({
    //   where: { name: 'elm' },
    // })

    // if (elm) {
    //   console.log('ELM deleted')
    // }

    console.log('Shill stats saved')
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.send('Error')
  }
})

router.get('/shill/stats', async (_req: Request, res: Response) => {
  try {
    let stats = await prisma.shill.findMany()

    res.json({ success: true, data: stats })
  } catch (err) {
    console.error(err)
    res.json({ success: false, error: 'Error fetching shill stats' })
  }
})

// DELETE SHILLER
router.delete('/shill/remove', async (req: Request, res: Response) => {
  const { name } = req.body as { name: string }

  try {
    const shiller = await prisma.shill.delete({
      where: { name },
    })
    res.json({ success: true, message: 'Shiller deleted', data: shiller })
  } catch (err: any) {
    console.error(err)
    res.json({ success: false, error: 'Error deleting shiller', data: err })
  }
})
router.get('/account', async (req: Request, res: Response) => {
  try {
    console.log('Fetching accounts', req.body)
    const accs = await prisma.cryptoAccount.findMany()
    res.json({ success: true, data: accs })
  } catch (error) {
    res.json({ success: false, error: 'Error fetching accounts' })
  }
})

export { router as ShillRouter }
