import { ApolloServerErrorCode } from '@apollo/server/errors'
import { Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

export const handlePrismaError = (error: {
  code: string
  meta?: { target: string; modelName: string; field_name: string }
}) => {
  let message = 'An error occurred while processing your request'

  let status = 500
  let code: string = ApolloServerErrorCode.INTERNAL_SERVER_ERROR

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        message = error.meta
          ? `${error.meta.modelName} with the same ${error.meta.target} already exists`
          : `Duplicate entry`
        status = 409
        code = ApolloServerErrorCode.BAD_REQUEST

        break

      case 'P2003' || 'P2014':
        let field_name =
          ((error.meta?.field_name || '').split('_')[1] || '').split(' ')[0] ||
          'id'

        message = `Invalid ${field_name} provided`

        status = 400
        code = ApolloServerErrorCode.BAD_REQUEST
        break

      case 'P2025':
        message = `Operation failed because it depends on a non-existent record`
        status = 404
        code = ApolloServerErrorCode.BAD_REQUEST
        break

      default:
        console.error(`Unhandled error`, error)
        break
    }
  } else {
    console.error(`Unhandled error`, error)
  }

  console.error('Prisma error', message, code)

  throw new GraphQLError(message, {
    extensions: {
      code,
      http: {
        status,
      },
    },
  })
}
