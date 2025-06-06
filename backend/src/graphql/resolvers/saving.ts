import { GraphQLError } from 'graphql'
import { arg, extendType, intArg, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import { calculateMatureDate } from '../../utils'

export const SavingQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('mySavings', {
      type: 'Saving',
      args: {
        where: arg({
          type: 'SavingWhereUniqueInput',
        }),

        orderBy: arg({
          type: 'SavingOrderByInput',
        }),
        take: intArg({ default: 10 }),
        skip: intArg({ default: 0 }),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { where, orderBy, take, skip } = removeEmpty(args)
        if (!user) {
          throw new GraphQLError('not authorized', {
            extensions: { code: 'NOT_AUTHORIZED' },
          })
        }

        try {
          return await prisma.saving.findMany({
            where: {
              ...where,
              userId: user.id,
            },
            orderBy,
            take,
            skip,
            include: {
              user: true,
              cryptoAccount: true,
              fiat: true,
              fiatWallet: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const SavingMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createSaving', {
      type: 'Saving',
      args: {
        data: nonNull(arg({ type: 'SavingCreateInput' })),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { data } = removeEmpty(args)
        if (!user) {
          throw new GraphQLError('not authorized', {
            extensions: { code: 'NOT_AUTHORIZED' },
          })
        }

        if (!(data.amount > 0)) {
          throw new GraphQLError('Amount must be greater than 0', {
            extensions: { code: 'INVALID_AMOUNT' },
          })
        }

        const matureAt = calculateMatureDate(data.period)

        if (matureAt) {
          throw new GraphQLError('Invalid duration', {
            extensions: { code: 'INVALID_DURATION' },
          })
        }
        try {
          const fiatWallet = await prisma.fiatWallet.create({
            data: {
              user: { connect: { id: user.id } },
              balance: 0,
              fiat: { connect: { id: data.fiatId } },
            },
          })

          return await prisma.saving.create({
            data: {
              ...data,
              user: {
                connect: {
                  id: user.id,
                },
              },
              fiatWallet: {
                connect: {
                  id: fiatWallet.id,
                },
              },
              matureAt,
              isCryptoAccount: !!data.cryptoAccountId, // Set isCryptoAccount to true if cryptoAccountId is provided
              cryptoAccount: data.cryptoAccountId
                ? {
                    connect: {
                      id: data.cryptoAccountId,
                    },
                  }
                : undefined,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
