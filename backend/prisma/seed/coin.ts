import { PrismaClient } from '@prisma/client'

export const coin = async (prisma: PrismaClient) => {
  let usdt = await prisma.coin.upsert({
    where: { symbol: 'USDT' },
    update: {},
    create: {
      name: 'USD Tether',
      symbol: 'USDT',
      network: {
        connect: {
          symbol: 'ETH',
        },
      },
    },
  })

  console.log({ usdt })
}
