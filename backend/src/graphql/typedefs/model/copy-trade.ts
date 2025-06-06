import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const CopyTrade = objectType({
  name: Model.CopyTrade.$name,
  description: Model.CopyTrade.$description,
  definition: (t) => {
    t.field(Model.CopyTrade.id)
    t.field(Model.CopyTrade.shiller)
    t.field(Model.CopyTrade.shillId)
    t.field(Model.CopyTrade.TradeInformation)
    t.field(Model.CopyTrade.TradeInformationId)
    t.field(Model.CopyTrade.closedPnl)
    t.field(Model.CopyTrade.netReturn)
    t.field(Model.CopyTrade.userId)
    t.field(Model.CopyTrade.user)
    t.field(Model.CopyTrade.leverage)
    t.field(Model.CopyTrade.amount)
    t.field(Model.CopyTrade.period)
    t.field(Model.CopyTrade.status)
    t.field(Model.CopyTrade.image)
    t.field(Model.CopyTrade.createdAt)
    t.field(Model.CopyTrade.updatedAt)
  },
})

export const CopyTradeResponse = objectType({
  name: 'CopyTradeResponse',
  definition(t) {
    t.string('message')
    // t.field('copyTrade', { type: 'CopyTrade' })
  },
})

export const TradingFee = objectType({
  name: 'TradingFee',
  definition(t) {
    t.string('copyTradeFee', {
      description: 'Use copyTradeFee instead, value is %',
    })
    t.string('ip2pFee', { description: 'Use copyTradeFee instead, value is %' })
    t.string('platformFee', { description: 'Platform fee, value is %' })
    t.string('additionalAmountInUsd', {
      description: 'Additional amount in USD',
    })
    t.string('currency', { description: 'Default currency used, value is %' })
  },
})
