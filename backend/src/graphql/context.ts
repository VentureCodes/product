import { BaseContext } from '@apollo/server'
import { PrismaClient } from '@prisma/client'
import { MamlakaSession } from './../typings'
import express from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { IUserPayload } from './../interfaces/IUserPayload'

export const prisma = new PrismaClient()
// Context
export interface Context extends BaseContext {
  prisma: PrismaClient
  res: express.Response<any, Record<string, any>>
  req: express.Request<
    ParamsDictionary,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >
  user?: IUserPayload
  mamlakaSession: MamlakaSession
}
