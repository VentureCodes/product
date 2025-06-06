import { PrismaClient, PostCategory, PostTopic } from '@prisma/client'
const prisma = new PrismaClient()

import { ad } from './ad'
import { coin } from './coin'
import { country } from './country'
import { fiat } from './fiat'
import { network } from './network'
import { paymentMethod } from './paymentMethod'
import { posts } from './post'
// import { traders } from './trader'
import { users } from './users'
import { copyTrades } from './copyTrade'
import { udpateWallets } from './wallet'
import { shillers } from './shiller'

import { categoriesForFeeds } from './categories'
import { token } from './token'
import { tokenHoldings } from './tokenHoldings'

const Main = async () => {
  console.info('Seeding countries...')
  await country(prisma)
  console.info('Countries seeded successfully ✓')

  console.info('Seeding currencies...')
  await fiat(prisma)
  console.info('Currencies seeded successfully ✓')

  console.info('Seeding networks...')
  await network(prisma)
  console.info('Networks seeded successfully ✓')

  console.info('Seeding users...')
  const userIds = await users(prisma)
  console.info('Users seeded successfully ✓')
  console.log('Seeding random users')

  console.info('Seeding payment methods...')
  await paymentMethod(prisma)
  console.info('Payment methods seeded successfully. ✓')

  console.info('Seeding coins...')
  await coin(prisma)
  console.info('Coins seeded successfully. ✓')

  console.info('Seeding ads...')
  await ad(prisma)
  console.info('Ads seeded successfully. ✓')

  const categories = Object.values(PostCategory)
  const topics = Object.values(PostTopic)

  console.info('Seeding posts...')
  for (const category of categories) {
    for (const topic of topics) {
      await posts(prisma, category, topic)
    }
  }
  console.info('Posts seeded successfully ✓')

  console.info('Seeding traders...')
  // const traderId = await traders(prisma)

  // console.info('Traders seeded successfully ✓')
  console.info('Seeding shillers...')
  await shillers(prisma)
  console.info('Shillers seeded successfully ✓')

  console.info('Seeding copy trades...')
  const copyTradeIds: string[] = []
  let sum = 0
  if (userIds.length > 0) {
    for (const userId of userIds) {
      const { copyTradeId, amount } = await copyTrades(
        prisma,
        'b75fd6b6-a1f1-43b8-87d5-c19875f3071b',
        userId,
      )
      sum += amount
      copyTradeIds.push(copyTradeId)
    }
  }
  console.info('Copy trades seeded successfully ✓')

  await udpateWallets(prisma)
  console.info('Wallets updated successfully ✓')
  console.info('Trade groups seeded successfully ✓')

  console.info('Seeding categories for feeds...')
  await categoriesForFeeds(prisma)

  console.info('Seeding tokens...')
  await token(prisma)
  console.info('Tokens seeded successfully ✓')

  console.info('Seeding token holdings...')
  await tokenHoldings(prisma)
  console.info('Token holdings seeded successfully ✓')
}

Main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
