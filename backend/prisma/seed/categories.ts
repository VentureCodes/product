// TODO: this is a temporary solution, we need to find a better way to seed the database
// Give all wallets testing amounts
import { PrismaClient } from '@prisma/client'

export const categoriesForFeeds = async (prisma: PrismaClient) => {
  const categories = ['Education', 'Money', 'General']

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category },
    })

    if (!existingCategory) {
      try {
        await prisma.category.upsert({
          where: { name: category },
          update: {}, // If the category exists, do nothing
          create: {
            name: category,
            icon: 'https://cdn-icons-png.flaticon.com/512/1160/1160802.png',
          },
        })
      } catch (error) {
        console.error(`Failed to seed category '${category}':`, error)
      }
    } else {
      console.log(`Category '${category}' already exists`)
    }
  }
}
