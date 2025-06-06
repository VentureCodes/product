import { arg, extendType, intArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import { generateApiKey } from '../../utils/common'
import { addMonths } from 'date-fns'

export const ApiKeyQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('apiKeys', {
      type: 'ApiKey',
      args: {
        where: arg({
          type: 'ApiKeyWhereInput',
        }),
        skip: intArg(),
        orderBy: arg({
          type: 'ApiKeyOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { where, orderBy, take, skip } = removeEmpty(args)

        // Check if the user is authenticated
        if (!user || !user.id) {
          throw new Error(
            'Unauthorized: User must be logged in to handle API key.',
          )
        }

        try {
          return await prisma.apiKey.findMany({
            where: {
              ...where,
              userId: user.id, // Only fetch keys for the authenticated user
            },
            orderBy: orderBy ?? { createdAt: 'desc' },
            take: take ?? undefined,
            skip,
            include: {
              user: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('apiKey', {
      type: 'ApiKey',
      args: {
        where: arg({
          type: 'ApiKeyWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { where } = removeEmpty(args)

        // Check if the user is authenticated
        if (!user || !user.id) {
          throw new Error(
            'Unauthorized: User must be logged in to handle API key.',
          )
        }

        try {
          const apiKey = await prisma.apiKey.findUnique({
            where,
            include: {
              user: true,
            },
          })

          // Check if the API key exists and belongs to the user
          if (apiKey && apiKey.userId !== user.id) {
            throw new Error(
              'Unauthorized: You do not have permission to access this API key.',
            )
          }

          return apiKey
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const ApiKeyMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createApiKey', {
      type: 'ApiKey',
      args: {
        data: arg({
          type: 'ApiKeyCreateInput',
        }),
      },
      resolve: async (_, args, { prisma, user }) => {
        // Check if the user is authenticated
        if (!user || !user.id) {
          throw new Error(
            'Unauthorized: User must be logged in to create an API key.',
          )
        }

        const { data } = removeEmpty(args)

        // get the userId from the user object
        const userId = user.id

        try {
          const apiKey = generateApiKey()

          // Calculate the expiration date (6 months from now)
          const expirationDate = addMonths(new Date(), 6)

          return await prisma.apiKey.create({
            data: {
              key: apiKey,
              userId: userId,
              isActive: data.isActive ?? true,
              expiresAt: expirationDate,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateApiKey', {
      type: 'ApiKey',
      args: {
        where: arg({
          type: 'ApiKeyWhereUniqueInput',
        }),
        data: arg({
          type: 'ApiKeyUpdateInput',
        }),
      },
      resolve: async (_, args, { prisma, user }) => {
        // Check if the user is authenticated
        if (!user || !user.id) {
          throw new Error(
            'Unauthorized: User must be logged in to create an API key.',
          )
        }

        const { where, data } = removeEmpty(args)

        try {
          return await prisma.apiKey.update({
            where,
            data: {
              isActive: data.isActive,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteApiKey', {
      type: 'ApiKey',
      args: {
        where: arg({
          type: 'ApiKeyWhereUniqueInput',
        }),
      },
      resolve: async (_, args, { prisma, user }) => {
        // Check if the user is authenticated
        if (!user || !user.id) {
          throw new Error(
            'Unauthorized: User must be logged in to create an API key.',
          )
        }

        const { where } = removeEmpty(args)

        try {
          return await prisma.apiKey.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
