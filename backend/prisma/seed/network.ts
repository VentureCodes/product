import { PrismaClient } from '@prisma/client'

export const network = async (prisma: PrismaClient) => {
  let ethereum = await prisma.network.upsert({
    where: { name: 'Ethereum' },
    update: {},
    create: {
      id: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      explorer: 'https://etherscan.io',
      nativeToken: 'ETH',
    },
  })

  if (process.env.NODE_ENV !== 'development' && ethereum) {
    // new NetworkCreatedPublisher(natsWrapper.client).listen()
  }

  console.log({ ethereum })
}
