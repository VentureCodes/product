import { PrismaClient } from '@prisma/client'

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

export const shillers = async (prisma: PrismaClient) => {
  try {
    // CREATE DEFAULT SHILLER
    const shiller = await prisma.shill.upsert({
      where: { id: 'b75fd6b6-a1f1-43b8-87d5-c19875f3071b' },
      update: {},
      create: {        
        name: 'Smart!!Plays',
        photo: getRandomPhotoUrl(),
      },
    })

    return shiller
  } catch (error) {
    console.error(`Seeding Shillers Error`, error)
    return null
  }
}
