import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

export const copyTrades = async (
  prisma: PrismaClient,
  shillerId: string,
  userId: string,
) => {
  try {
    const copyTrade = await prisma.copyTrade.create({
      data: {
        shiller: {
          connect: {
            id: shillerId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },

        amount: faker.number.int({ min: 100, max: 1000 }),
        leverage: faker.helpers.arrayElement([2, 3, 5]),
        period: faker.number.int({ min: 1, max: 5 }),
      },
    })
    return { copyTradeId: copyTrade.id, amount: copyTrade.amount }
  } catch (error: any) {
    console.log('Seeding Traders Error: ', error)
    throw new Error('Seeding Traders Error')
  }
}
