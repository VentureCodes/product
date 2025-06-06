import { PrismaClient } from '@prisma/client'

export const tokenHoldings = async (prisma: PrismaClient) => {
  const userIds = await prisma.user.findMany()
  const id = userIds.map((user) => user.id)
  let userId = ''
  for (const _userId of id) {
    userId = _userId
    console.log({ userId })

    return userId
  }

  // const holdings = await prisma.tokenHolding.createMany({
  //   data: [
  //     {
  //       tokenSymbol: 'ETH',
  //       amount: 100,
  //       availableBal: 100,
  //       userId,
  //     },
  //     {
  //       tokenSymbol: 'BTC',
  //       amount: 100,
  //       availableBal: 100,
  //       userId,
  //     },
  //     {
  //       tokenSymbol: 'USDT',
  //       amount: 100,
  //       availableBal: 100,
  //       userId,
  //     },
  //     {
  //       tokenSymbol: 'USDC',
  //       amount: 100,
  //       availableBal: 100,
  //       userId,
  //     },
  //   ],
  // })

  // const BTC = await prisma.tokenHolding.upsert({
  //   where: { tokenSymbol: 'BTC' },
  //   update: {},
  //   create: {
  //     token: {
  //       connect: {
  //         symbol: 'BTC',
  //       },
  //     },
  //     amount: 100,
  //     availableBal: 100,
  //     user: {
  //       connect: {
  //         id: userId
  //       },
  //     },
  //   },
  // })

  // const USDT = await prisma.tokenHolding.upsert({
  //   where: { tokenSymbol: 'USDT' },
  //   update: {},
  //   create: {
  //     token: {
  //       connect: {
  //         symbol: 'USDT',
  //       },
  //     },
  //     amount: 100,
  //     availableBal: 100,
  //     user: {
  //       connect: {
  //         id: userId
  //       },
  //     },
  //   },
  // })

  // const USDC = await prisma.tokenHolding.upsert({
  //   where: { tokenSymbol: 'USDC' },
  //   update: {},
  //   create: {
  //     token: {
  //       connect: {
  //         symbol: 'USDC',
  //       },
  //     },
  //     amount: 100,
  //     availableBal: 100,
  //     user: {
  //       connect: {
  //         id: userId
  //       },
  //     },
  //   },
  // })

  // console.log({
  //   holdings,
  //   //  BTC, USDT, USDC
  // })

  return {}
}
