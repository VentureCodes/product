import { PrismaClient } from '@prisma/client'

//seed token script
export const token = async (prisma: PrismaClient) => {
  const ETH = await prisma.token.upsert({
    where: { symbol: 'ETH' },
    update: {},
    create: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      address: '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29E',
      isActive: true,
    },
  })

  const BTC = await prisma.token.upsert({
    where: { symbol: 'BTC' },
    update: {},
    create: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
      address: '0x4DB5a66E937A9F4473fA95b1cAF1d1E1D2E29EA',
      isActive: true,
    },
  })

  const USDT = await prisma.token.upsert({
    where: { symbol: 'USDT' },
    update: {},
    create: {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      address: '0x4DB5a66E937A9F4473fA95b1cF1d1E1D62E29EA',
      isActive: true,
    },
  })

  const USDC = await prisma.token.upsert({
    where: { symbol: 'USDC' },
    update: {},
    create: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      address: '0x4DB5a66E937A9F447fA95b1cAF1d1E1D62E29EA',
      isActive: true,
    },
  })

  console.log({ ETH, BTC, USDT, USDC })
  const tokensId = [ETH.id, BTC.id, USDT.id, USDC.id]

  return tokensId

  // for (const tokenId of tokensId) {
  //   const userIds = await prisma.user.findMany()
  //   const id = userIds.map((user) => user.id)
  //   let userId = ''
  //   for (const _userId of id) {
  //     userId = _userId
  //     console.log({ userId })

  //     return userId
  //   }

  //   if (
  //     !(await prisma.tokenHolding.findFirst({
  //       where: { tokenId: tokenId, userId },
  //     }))
  //   ) {
  //     const holdings = await prisma.tokenHolding.create({
  //       data: [
  //         {
  //           tokenId,
  //           amount: 100,
  //           availableBal: 100,
  //           userId,
  //         },
  //       ],
  //     })

  //     console.log({ holdings })
  //   }
  // }
}
