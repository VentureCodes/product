import { PrismaClient } from '@prisma/client'

// M-PESA Kenya (Safaricom)
// M-pesa Paybill
// Bank Transfer
// Equity Bank
// Airtel Money
// Stanbic Bank
// Airtime Mobile Top-Up
// Cash Deposit to Bank
// Standard Chartered Bank
// Co-Operative Bank Of Kenya
// Access Bank
// Ecobank
// GTBank
// Zenith Bank

export const paymentMethod = async (prisma: PrismaClient) => {
  const mpesa = await prisma.paymentMethod.upsert({
    where: { name: 'M-PESA' },
    update: {},
    create: {
      name: 'M-PESA',
      category: 'Mobile Money',
      country: {
        connect: { name: 'Kenya' },
      },
    },
  })

  const card = await prisma.paymentMethod.upsert({
    where: { name: 'Card' },
    update: {},
    create: {
      name: 'Card',
      category: 'Card',
      country: {
        connect: { name: 'Kenya' },
      },
    },
  })

  const wallet = await prisma.paymentMethod.upsert({
    where: { name: 'Wallet' },
    update: {},
    create: {
      name: 'Wallet',
      category: 'Wallet',
      country: {
        connect: { name: 'Kenya' },
      },
    },
  })

  console.log({ mpesa, card, wallet })
}
