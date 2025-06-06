import { PrismaClient } from '@prisma/client'
import express from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { MamlakaSession, IJwtPayload } from 'src/typings'

export interface IApolloServerContext {
  prisma: PrismaClient
  user?: IJwtPayload
  res: express.Response<any, Record<string, any>>
  req: express.Request<
    ParamsDictionary,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >
  mamlakaSession: MamlakaSession
}
