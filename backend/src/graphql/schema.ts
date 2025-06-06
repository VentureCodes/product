import { applyMiddleware } from 'graphql-middleware'
import { makeSchema } from 'nexus'
import { DateTime, Json } from 'nexus-prisma/scalars'
import { join } from 'path'
import { permissions } from './permissions'
import { $Mutation, $Query } from './resolvers'
import { $Enum, $Input, $Model } from './typedefs'

const schemaWithoutPermissions = makeSchema({
  types: [$Query, $Mutation, $Input, $Model, $Enum, DateTime, Json],
  shouldGenerateArtifacts: process.env.NODE_ENV === 'development',
  outputs: {
    schema: join(__dirname, 'generated/schema.gen.graphql'),
    typegen: join(__dirname, 'generated/nexusTypes.gen.ts'),
  },
  contextType: {
    module: join(__dirname, 'context.ts'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})

export const schema = applyMiddleware(schemaWithoutPermissions, permissions)