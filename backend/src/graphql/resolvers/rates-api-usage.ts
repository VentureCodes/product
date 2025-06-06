import { extendType, intArg, stringArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

// Define the resolver for querying API key usage
export const ApiKeyUsageQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('apiKeyUsage', {
      type: 'ApiKeyUsage', 
      args: {
        apiKeyId: stringArg(),
        date: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_, args, { prisma }) => {
        const { apiKeyId, date, take, skip } = removeEmpty(args)

        try {
          // Query the usage data for a specific API key and optionally filter by date
          return await prisma.apiKeyUsage.findMany({
            where: {
              apiKeyId,
              date, 
            },
            take: take ?? 10, 
            skip: skip ?? 0, 
            orderBy: {
              date: 'desc', 
            },
            select: {
              id: true,
              apiKeyId: true,
              date: true,
              usageCount: true,
              apiKey: {
                select: {
                  key: true,
                  userId: true,
                  expiresAt: true,
                  isActive: true,
                },
              },
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
