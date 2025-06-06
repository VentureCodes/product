import { PrismaClient } from '@prisma/client'

export const fiat = async (prisma: PrismaClient) => {
  const kes = await prisma.fiat.upsert({
    where: { symbol: 'KES' },
    update: {},
    create: {
      name: 'Kenyan Shilling',
      symbol: 'KES',
      country: {
        connect: {
          name: 'Kenya',
        },
      },
    },
  })

  const ugx = await prisma.fiat.upsert({
    where: { symbol: 'UGX' },
    update: {},
    create: {
      name: 'Ugandan Shilling',
      symbol: 'UGX',
      country: {
        connect: {
          name: 'Uganda',
        },
      },
    },
  })

  const rwf = await prisma.fiat.upsert({
    where: { symbol: 'RWF' },
    update: {},
    create: {
      name: 'Rwandan Franc',
      symbol: 'RWF',
      country: {
        connect: {
          name: 'Rwanda',
        },
      },
    },
  })

  const tzs = await prisma.fiat.upsert({
    where: { symbol: 'TZS' },
    update: {},
    create: {
      name: 'Tanzanian Shilling',
      symbol: 'TZS',
      country: {
        connect: {
          name: 'Tanzania',
        },
      },
    },
  })

  const bdi = await prisma.fiat.upsert({
    where: { symbol: 'BIF' },
    update: {},
    create: {
      name: 'Burundian Franc',
      symbol: 'BIF',
      country: {
        connect: {
          name: 'Burundi',
        },
      },
    },
  })

  const ssp = await prisma.fiat.upsert({
    where: { symbol: 'SDG' },
    update: {},
    create: {
      name: 'Sudanese Pound',
      symbol: 'SDG',
      country: {
        connect: {
          name: 'Sudan',
        },
      },
    },
  })

  console.log({ kes, ugx, rwf, tzs, bdi, ssp })
}
