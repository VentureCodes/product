import { PrismaClient, PostCategory, PostTopic } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { PostData, PostSourceData } from '../seed/data'

export const posts = async (
  prisma: PrismaClient,
  category: PostCategory,
  topic: PostTopic,
) => {
  try {
    const sourceRecords = await Promise.all(
      PostSourceData.map(async (source) => {
        return await prisma.postSource.upsert({
          where: { name: source.NAME! },
          update: {
            icon: source.ICON!,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            name: source.NAME!,
            icon: source.ICON! || faker.image.url(),
          },
        })
      }),
    )

    for (const post of PostData) {
      const correspondingSource = PostSourceData.find(
        (source) => source.TITLE === post.TITLE,
      )

      const createdPost = await prisma.post.create({
        data: {
          author: correspondingSource?.AUTHOR || faker.person.fullName(),
          title: post.TITLE! || faker.lorem.sentence(),
          summary: post.SUMMARY!,
          link: correspondingSource?.LINK || faker.internet.url(),
          image: correspondingSource?.IMAGE || faker.image.url(),
          source: {
            connect: {
              name:
                correspondingSource?.NAME ||
                sourceRecords[Math.floor(Math.random() * sourceRecords.length)]
                  .name,
            },
          },
          category: category,
          topic: topic,
        },
      })

      await prisma.postImpressions.create({
        data: {
          postId: createdPost.id,
          likes: faker.number.int({ min: 0, max: 100 }),
          disLikes: faker.number.int({ min: 0, max: 100 }),
          shares: faker.number.int({ min: 0, max: 100 }),
        },
      })
    }

    console.log('Seeding Posts Completed')
  } catch (error) {
    console.log('Seeding Posts Error', error)
  }
}
