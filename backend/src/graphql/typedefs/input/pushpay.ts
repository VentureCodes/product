import { inputObjectType } from 'nexus'

export const PushPayWhereInput = inputObjectType({
  name: 'PushPayWhereInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
    t.string('token')
    t.string('senderInvoiceId', {
      description:
        'The invoice number of the sender, used when making a payment to a pull request',
    })
    t.string('receiverInvoiceId', {
      description:
        'The invoice number of the receiver, used when making a payment to a pull request',
    })
    t.nonNull.string('phone')
    t.nonNull.field('method', {
      type: 'PushPaymentMethod',
    })
    t.nonNull.string('amount')
  },
})
export const PushPayClaimWhereInput = inputObjectType({
  name: 'PushPayClaimWhereInput',
  definition(t) {
    t.nonNull.string('senderPhone')
    t.string('senderInvoiceId')
    t.nonNull.string('receiverPhone')
    t.string('receiverInvoiceId')
    t.string('token')
    t.nonNull.field('method', {
      type: 'PushPaymentMethod',
    })
  },
})

export const PushPayPullWhereInput = inputObjectType({
  name: 'PushPayPullWhereInput',
  definition(t) {
    t.string('name', { description: 'The name of the sender' })
    t.string('phone', { description: 'The phone number of the sender' })
    t.nonNull.string('amount', { description: 'The amount to be sent' })
    t.string('email', { description: 'Email of the sender' })
    t.string('token', { description: 'Token being sent' })
    t.string('currency', {
      description: 'The currency of the payment',
      default: 'KES',
    })
    t.nonNull.string('description', {
      description: 'The description of the payment',
    }),
      t.nonNull.field('method', {
        type: 'PushPaymentMethod',
      })
  },
})
