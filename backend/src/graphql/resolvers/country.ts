import { arg, extendType, nonNull } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'

export const CountryQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('countries', {
      type: 'Country',
      args: {
        where: arg({
          type: 'CountryWhereInput',
        }),
        orderBy: arg({
          type: 'CountryOrderByInput',
        }),
      },

      resolve: async (_, args, { prisma }) => {
        const { where, orderBy } = removeEmpty(args)

        try {
          return await prisma.country.findMany({
            where,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nullable.field('country', {
      type: 'Country',
      args: {
        where: nonNull(
          arg({
            type: 'CountryWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)

        try {
          return await prisma.country.findUnique({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const CountryMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('createCountry', {
      type: 'Country',
      args: {
        data: nonNull(arg({ type: 'CountryCreateInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.country.create({ data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateCountry', {
      type: 'Country',
      args: {
        where: nonNull(arg({ type: 'CountryWhereUniqueInput' })),
        data: arg({ type: 'CountryUpdateInput' }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.country.update({ where, data })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.field('deleteCountry', {
      type: 'Country',
      args: {
        where: nonNull(arg({ type: 'CountryWhereUniqueInput' })),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          return await prisma.country.delete({ where })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
