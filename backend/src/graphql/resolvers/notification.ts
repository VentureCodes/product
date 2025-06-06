import { arg, extendType, intArg, nonNull, stringArg } from 'nexus'
import { handlePrismaError, removeEmpty } from '../helper'
import { GraphQLError } from 'graphql'

export const NotificationQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('notifications', {
      type: 'Notification',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'NotificationWhereOrderByInput',
        }),
        where: arg({
          type: 'NotificationWhereInput',
        }),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where, take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.notification.findMany({
            where,
            take,
            skip,
            orderBy,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    t.nonNull.list.nonNull.field('myNotifications', {
      type: 'Notification',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'NotificationWhereOrderByInput',
        }),
        where: arg({
          type: 'NotificationWhereInput',
        }),
      },

      resolve: async (_root, args, { prisma, user }) => {
        const { take, skip, orderBy, where } = removeEmpty(args)

        try {
          return await prisma.notification.findMany({
            where: {
              userId: user?.id,
              ...where,
            },
            take,
            skip,
            orderBy,
          })
        } catch (error: any) {
          console.log('Error fetching notifications:', error)
          return handlePrismaError(error)
        }
      },
    })

    t.field('notification', {
      type: 'Notification',
      args: {
        where: nonNull(arg({ type: 'NotificationWhereUniqueInput' })),
      },
      resolve: async (_root, args, { prisma }) => {
        const { where } = removeEmpty(args)
        try {
          return await prisma.notification.findUnique({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})

export const NotificationMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    t.field('updateNotification', {
      type: 'Notification',
      args: {
        notificationId: nonNull(stringArg()),
        status: nonNull(arg({ type: 'NotificationStatus' })),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { notificationId, status } = removeEmpty(args)

        try {
          // Ensure the notification belongs to the user and exists
          const notification = await prisma.notification.findFirst({
            where: {
              id: notificationId,
              userId: user?.id,
            },
          })

          if (!notification) {
            throw new GraphQLError(
              'Notification not found or does not belong to user',
            )
          }

          // Update the notification status
          const updatedNotification = await prisma.notification.update({
            where: {
              id: notificationId,
            },
            data: {
              status,
            },
          })

          return updatedNotification
        } catch (error: any) {
          console.error('Error updating notification:', error)
          return handlePrismaError(error)
        }
      },
    })

    t.field('updateMyNotificationsStatus', {
      type: 'UpdateNotificationType',
      args: {
        status: nonNull(arg({ type: 'NotificationStatus' })),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { status } = removeEmpty(args)

        try {
          // Update all notifications for the user
          await prisma.notification.updateMany({
            where: {
              userId: user?.id,
            },
            data: {
              status,
            },
          })

          return {
            message: 'Notifications updated successfully',
            success: true,
          }
        } catch (error: any) {
          console.error('Error updating notifications:', error)
          return handlePrismaError(error)
        }
      },
    })
  },
})
