import { enumType, inputObjectType } from 'nexus'

export const FilterPaymentMethod = enumType({
  name: 'FilterPaymentMethod',
  members: ['mpesa', 'card'],
})

export const SubscriptionInput = inputObjectType({
  name: 'SubscriptionInput',
  definition(t) {
    t.string('phone')
    t.field('payment_method', {
      type: 'FilterPaymentMethod',
      description: 'The type of payment method',
    })
  },
})
