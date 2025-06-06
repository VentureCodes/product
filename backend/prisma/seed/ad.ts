import { faker } from '@faker-js/faker'
import { PrismaClient, Side } from '@prisma/client'

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const ad = async (prisma: PrismaClient) => {
  try {
    // Delete transactions, which may depend on traders
    // const isDeletedTransactions = await prisma.transaction.deleteMany()
    // console.log('Deleted all transactions', isDeletedTransactions)
    await prisma.contact.deleteMany()
    await prisma.monthlyPerformance.deleteMany()
    await prisma.performanceHistory.deleteMany()
    await prisma.strategy.deleteMany()
    console.log('Deleted all strategies')
    // const isDeletedCopyTrade = await prisma.copyTrade.deleteMany()
    // console.log('Deleted all traders', isDeletedCopyTrade)
    // Finally delete traders, which might be referenced by transactions or ads
    // const isDeletedTraders = await prisma.trader.deleteMany()
    // console.log('Deleted all traders', isDeletedTraders)
    // Assuming 'ad' has no dependencies or is at the bottom of the dependency chain
    await prisma.ad.deleteMany()
    console.log('Deleted all ads')
  } catch (error) {
    console.error('Failed to delete data:', error)
    return
  }

  // delete all ads
  let advertisers = await prisma.user.findMany({
    where: { phone: '254716110371' },
  })

  console.log({ advertisers: advertisers.length })
  const size = Math.round(advertisers.length / 2)
  console.log({ size })
  let [sellers, buyers] = advertisers.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(advertisers.slice(i, i + size))
    return acc
  }, [] as (typeof advertisers)[])

  console.log({ sellers, buyers })

  let terms =
    'Make payment before marking as paid. NO FRAUDULENT FUNDS. Use third party at your own risk. Fastest p2p payment. No third party. Follow instructions. Only use Mpesa registered under DollarsApp name. No bank to Mpesa. No Pesa Link from Loop or I&M bank. No cross border payment. Don’t mark as paid before payment. Leave positive feedback.'

  // [
  //   'Kindly make payment before marking as paid',
  //   'Dont pay me using dirty/fraudulent funds it wont end well for you!!!!!!!!!'.toUpperCase(),
  //   'Use third party at your own risk as i will not release your coins'.toUpperCase(),
  //   '💃🕺 Enjoy the fastest payment method on p2p',
  //   'Strictly no third party',
  //   'You were warned',
  //   'Only use Mpesa registered under same name as DollarsApp, any different payment wont go through',
  //   'No bank to Mpesa',
  //   'I dont accept Pesa Link from  Loop and I&M bank.You will call your bank for reversal if you go against this.I wont release or refund',
  //   'Don’t mark as pay before payment plz',
  //   'No cross border payment',
  //   'Follow the instructions',
  //   'Leave a positive feedback kindly',
  // ]

  // let simpleFaker = new SimpleFaker()

  const currencyPair = `USD_KES`

  // Check if the rate is already cached
  const cached = await prisma.currencyRateCache.findFirst({
    where: {
      OR: [
        {
          currencyPair,
        },
        {
          currencyPair,
        },
      ],
    },
  })

  const buyPrice = Number(((cached?.rate || 129.99) * 1.015).toFixed(2))
  const sellPrice = Number(((cached?.rate || 129.99) * 0.985).toFixed(2))

  let paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      country: {
        code: 'KE',
      },
    },
  })

  let buyAds
  let sellAds
  const buyAdd = await prisma.ad.findMany({
    where: {
      side: 'Buy',
    },
  })
  const sellAdd = await prisma.ad.findMany({
    where: {
      side: 'Sell',
    },
  })

  // update rates
  if (sellAdd.length > 0 || buyAdd.length > 0) {
    const adList = await prisma.ad.findMany()
    console.log({ adList })
    // loop and
    adList.forEach(async (ad) => {
      await prisma.ad.update({
        where: {
          id: ad.id,
        },
        data: {
          price: ad.side === 'Buy' ? buyPrice : sellPrice,
        },
      })
      console.log('Updated ad =----------- ', ad.id)
    })
  }

  advertisers.forEach(async ({ id }) => {
    // Buyer ads
    if (buyAdd.length < 1) {
      await prisma.ad.create({
        data: {
          advertiser: {
            connect: {
              id,
            },
          },
          price: buyPrice,
          fiat: {
            connect: {
              symbol: 'KES',
            },
          },
          coin: {
            connect: {
              symbol: 'USDT',
            },
          },
          limit: faker.number.float({ fractionDigits: 4, max: 100 }),
          available: faker.number.float({
            fractionDigits: 4,
            min: 100,
            max: 1000,
          }),
          side: Side.Buy,
          duration: faker.number.int({ max: 60 }),
          paymentMethods: {
            connect: paymentMethods.map(({ id }) => ({ id })),
          },
          terms: terms,
          isApproved: true,
        },
      })
    }
    if (sellAdd.length < 1) {
      // sell ads
      await prisma.ad.create({
        data: {
          advertiser: {
            connect: {
              id,
            },
          },
          price: sellPrice,
          fiat: {
            connect: {
              symbol: 'KES',
            },
          },
          coin: {
            connect: {
              symbol: 'USDT',
            },
          },
          limit: faker.number.float({ fractionDigits: 4, max: 100 }),
          available: faker.number.float({
            fractionDigits: 4,
            min: 1000,
            max: 100000,
          }),
          side: Side.Sell,
          duration: faker.number.int({ max: 60 }),
          paymentMethods: {
            connect: paymentMethods.map(({ id }) => ({ id })),
          },
          terms: terms,
          isApproved: true,
        },
      })
    }
  })
  console.log({ sellAds, buyAds })
}
