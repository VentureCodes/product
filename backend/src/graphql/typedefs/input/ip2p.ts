import { inputObjectType } from 'nexus'

export const UserWhereUniqueInput = inputObjectType({
  name: 'UserWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('phone')
  },
})

export const CountryWhereUniqueInput = inputObjectType({
  name: 'CountryWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('name')
    t.string('code')
    t.string('dial')
  },
})

export const CountryCreateInput = inputObjectType({
  name: 'CountryCreateInput',
  definition: (t) => {
    t.nonNull.string('name')
    t.nonNull.string('code')
    t.nonNull.string('dial')
    t.field('fiat', { type: 'FiatCreateInput' })
  },
})

export const CountryUpdateInput = inputObjectType({
  name: 'CountryUpdateInput',
  definition: (t) => {
    t.string('name')
    t.string('code')
    t.string('dial')
    t.boolean('isActive')
    t.field('fiat', { type: 'FiatUpdateInput' })
  },
})

export const CountryWhereInput = inputObjectType({
  name: 'CountryWhereInput',
  definition: (t) => {
    t.string('name')
    t.string('code')
    t.string('dial')
  },
})

export const CountryOrderByInput = inputObjectType({
  name: 'CountryOrderByInput',
  definition: (t) => {
    t.field('name', { type: 'SortOrder' })
    t.field('code', { type: 'SortOrder' })
    t.field('dial', { type: 'SortOrder' })
  },
})

export const FiatWhereUniqueInput = inputObjectType({
  name: 'FiatWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('name')
    t.string('symbol')
    t.string('countryId')
  },
})

export const FiatCreateInput = inputObjectType({
  name: 'FiatCreateInput',
  definition: (t) => {
    t.nonNull.string('name')
    t.nonNull.string('symbol')
    t.nonNull.string('countryId')
  },
})

export const FiatUpdateInput = inputObjectType({
  name: 'FiatUpdateInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
    t.field('country', { type: 'CountryUpdateInput' })
    t.string('countryId')
    t.boolean('isActive')
  },
})

export const FiatWhereInput = inputObjectType({
  name: 'FiatWhereInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
  },
})

export const FiatOrderByInput = inputObjectType({
  name: 'FiatOrderByInput',
  definition: (t) => {
    t.field('name', { type: 'SortOrder' })
    t.field('symbol', { type: 'SortOrder' })
  },
})

export const AdWhereUniqueInput = inputObjectType({
  name: 'AdWhereUniqueInput',
  definition: (t) => {
    t.id('id')
  },
})

export const AdCreateInput = inputObjectType({
  name: 'AdCreateInput',
  definition: (t) => {
    t.string('advertiserId')
    t.nonNull.float('price')
    t.nonNull.string('fiatId')
    t.nonNull.string('coinId')
    t.nonNull.float('limit')
    t.nonNull.float('available')
    t.nonNull.field('side', { type: 'Side' })
    t.nonNull.int('duration')
    t.string('terms')
    t.nonNull.list.nonNull.field('paymentMethods', {
      type: 'PaymentMethodsInput',
    })
    t.boolean('isApproved')
  },
})

export const AdUpdateInput = inputObjectType({
  name: 'AdUpdateInput',
  definition: (t) => {
    t.float('price')
    t.float('limit')
    t.float('available')
    t.nonNull.list.nonNull.field('paymentMethods', {
      type: 'PaymentMethodsInput',
    })
    t.int('duration')
    t.string('terms')
    t.boolean('isActive')
    t.boolean('isApproved')
  },
})

export const AdWhereInput = inputObjectType({
  name: 'AdWhereInput',
  definition: (t) => {
    t.field('advertiser', { type: 'UserWhereUniqueInput' })
    t.string('advertiserId')
    t.field('fiat', { type: 'FiatWhereInput' })
    t.string('fiatId')
    t.field('coin', { type: 'CoinWhereInput' })
    t.string('coinId')
    t.field('side', { type: 'Side' })
    t.field('isApproved', { type: 'Boolean', default: true })
  },
})

export const AdOrderByInput = inputObjectType({
  name: 'AdOrderByInput',
  definition: (t) => {
    t.field('price', { type: 'SortOrder' })
    t.field('limit', { type: 'SortOrder' })
    t.field('available', { type: 'SortOrder' })
    t.field('duration', { type: 'SortOrder' })
  },
})

export const PaymentMethodWhereUniqueInput = inputObjectType({
  name: 'PaymentMethodWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('name')
  },
})

export const PaymentMethodWhereInput = inputObjectType({
  name: 'PaymentMethodWhereInput',
  definition: (t) => {
    t.string('name')
  },
})

export const PaymentMethodCreateInput = inputObjectType({
  name: 'PaymentMethodCreateInput',
  definition: (t) => {
    t.nonNull.string('name')
    t.nonNull.string('category')
    t.nonNull.string('countryId')
  },
})

export const PaymentMethodsInput = inputObjectType({
  name: 'PaymentMethodsInput',
  definition: (t) => {
    t.nonNull.list.nonNull.field('connect', {
      type: 'PaymentMethodWhereUniqueInput',
    })
  },
})

export const PaymentMethodUpdateInput = inputObjectType({
  name: 'PaymentMethodUpdateInput',
  definition: (t) => {
    t.string('name')
    t.string('category')
    t.field('country', { type: 'CountryUpdateInput' })
    t.string('countryId')
    t.boolean('isActive')
  },
})

export const PaymentMethodOrderByInput = inputObjectType({
  name: 'PaymentMethodOrderByInput',
  definition: (t) => {
    t.field('name', { type: 'SortOrder' })
    t.field('category', { type: 'SortOrder' })
  },
})

export const CoinWhereUniqueInput = inputObjectType({
  name: 'CoinWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('symbol')
  },
})

export const CoinWhereInput = inputObjectType({
  name: 'CoinWhereInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
    t.int('networkId')
  },
})

export const CoinOrderByInput = inputObjectType({
  name: 'CoinOrderByInput',
  definition: (t) => {
    t.field('name', { type: 'SortOrder' })
    t.field('symbol', { type: 'SortOrder' })
    t.field('networkId', { type: 'SortOrder' })
  },
})

export const CoinCreateInput = inputObjectType({
  name: 'CoinCreateInput',
  definition: (t) => {
    t.nonNull.string('name')
    t.nonNull.string('symbol')
    t.nonNull.int('networkId')
  },
})

export const CoinUpdateInput = inputObjectType({
  name: 'CoinUpdateInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
    t.int('networkId')
    t.field('network', { type: 'NetworkUpdateInput' })
    t.field('status', { type: 'CoinStatus' })
  },
})

export const NetworkWhereUniqueInput = inputObjectType({
  name: 'NetworkWhereUniqueInput',
  definition: (t) => {
    t.int('id')
    t.string('name')
    t.string('symbol')
  },
})

export const NetworkWhereInput = inputObjectType({
  name: 'NetworkWhereInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
  },
})

export const NetworkCreateInput = inputObjectType({
  name: 'NetworkCreateInput',
  definition: (t) => {
    t.nonNull.int('id')
    t.nonNull.string('name')
    t.nonNull.string('symbol')
    t.nonNull.string('explorer')
    t.nonNull.string('nativeToken')
  },
})

export const NetworkUpdateInput = inputObjectType({
  name: 'NetworkUpdateInput',
  definition: (t) => {
    t.string('name')
    t.string('symbol')
    t.string('explorer')
    t.string('nativeToken')
    t.boolean('isActive')
  },
})

export const NetworkOrderByInput = inputObjectType({
  name: 'NetworkOrderByInput',
  definition: (t) => {
    t.field('name', { type: 'SortOrder' })
    t.field('symbol', { type: 'SortOrder' })
  },
})

export const TransactionWhereUniqueInput = inputObjectType({
  name: 'TransactionWhereUniqueInput',
  definition: (t) => {
    t.id('id')
    t.string('invoiceNumber')
  },
})

export const TransactionWhereInput = inputObjectType({
  name: 'TransactionWhereInput',
  definition: (t) => {
    t.id('id')
    t.float('invoiceNumber')
    t.string('phone')
    t.string('adId')
    t.string('receiverId')
    t.string('receiverAddress')
    t.string('fiatId')
    t.string('coinId')
    t.float('amount')
    t.float('isActive')
    t.field('status', { type: 'TransactionStatus' })
  },
})

export const TransactionCreateInput = inputObjectType({
  name: 'TransactionCreateInput',
  definition: (t) => {
    t.nonNull.string('adId')
    t.nonNull.string('receiverId')
    t.nonNull.string('receiverAddress')
    t.nonNull.float('amount')
    t.nonNull.string('paymentMethodId')
  },
})

export const TransactionUpdateInput = inputObjectType({
  name: 'TransactionUpdateInput',
  definition: (t) => {
    t.id('id')
    t.string('invoiceNumber')
    t.string('paymentSecureId')
    t.string('phone')
    t.field('type', { type: 'TransactionType' })
    t.string('adId')
    t.string('receiverId')
    t.string('receiverAddress')
    t.float('amount')
    t.string('coinId')
    t.field('status', { type: 'TransactionStatus' })
    t.boolean('isActive')
  },
})

export const TransactionOrderByInput = inputObjectType({
  name: 'TransactionOrderByInput',
  definition: (t) => {
    t.field('id', { type: 'SortOrder' })
    t.field('invoiceNumber', { type: 'SortOrder' })
    t.field('adId', { type: 'SortOrder' })
    t.field('receiverId', { type: 'SortOrder' })
    t.field('amount', { type: 'SortOrder' })
    t.field('status', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
  },
})
