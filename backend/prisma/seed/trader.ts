import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

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

// Create random traders using the photo URLs
export const traders = async (prisma: PrismaClient) => {
  try {
    const trader = await prisma.trader.create({
      data: {
        name: faker.name.lastName(),
        yearOfExperience: 5,
        tradingStyle: 'SwingTrading',
        averageReturn: '15% per year',
        platform: 'Bybit',
        followers: 2000,
        tradesCopied: 1500,
        successRate: '75%',
        riskLevel: 'Moderate',
        bio: 'GVR is a seasoned trader with 5 years of experience in the financial markets. Specializing in swing trading, GVR has consistently achieved an average return of 15% per year. With a moderate risk level, GVR aims to maximize profits while minimizing potential losses.',

        photo: getRandomPhotoUrl(),

        contact: {
          create: {
            email: 'gvr@example.com',
            twitter: '@GVRTrader',
            linkedin: 'linkedin.com/in/gvrtrader',
          },
        },
        strategies: {
          create: {
            strategyId: 'Swing',
            name: 'Swing Strategy',
            description:
              'A strategy focusing on medium-term market swings, aiming to capture profits from market fluctuations.',
            averageReturn: '18% per year',
            riskLevel: 'High',
          },
        },

        performanceHistory: {
          create: {
            year: '2024',
            monthlyPerformance: {
              create: [
                { month: 'MAR', percentage: '35%' },
                { month: 'APR', percentage: '40%' },
                { month: 'MAY', percentage: '38%' },
              ],
            },
          },
        },
      },
    })

    return trader.id
  } catch (error) {
    console.log('Seeding Traders Error: ', error)
    return null
  }
}
