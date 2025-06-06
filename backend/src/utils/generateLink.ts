import { handlePrismaError } from './../graphql/helper'
export enum PushLinkType {
  WALLET = 'wallet',
  CRYPTO = 'crypto',
  MPESA = 'mpesa',
  CARD = 'card',
}

export const pushLink = async (opts: {
  host: string
  senderPhone: string
  receiverPhone: string
  type: PushLinkType
  senderInvoiceId?: string
  receiverInvoiceId?: string
  token?: string
}) => {
  try {
    const link = (await generateDynamicLink(
      opts.host,
      opts.senderPhone,
      opts.receiverPhone,
      opts.senderInvoiceId!,
      opts.receiverInvoiceId!,
      opts.type,
      opts.token,
    )) as string

    return link
  } catch (error: any) {
    return handlePrismaError(error)
  }
}
export const generateDynamicLink = async (
  host: string,
  senderPhone: string,
  receiverPhone: string,
  senderInvoiceId: string,
  receiverInvoiceId: string,
  type: PushLinkType,
  token?: string,
) => {
  try {
    const url = new URL(host)
    url.searchParams.append('sender', senderPhone)
    url.searchParams.append('receiver', receiverPhone)
    url.searchParams.append('method', type)

    if (senderInvoiceId)
      url.searchParams.append('senderInvoiceId', senderInvoiceId)
    if (receiverInvoiceId)
      url.searchParams.append('receiverInvoiceId', receiverInvoiceId)
    if (token) url.searchParams.append('token', token)

    const link = url.toString()

    return link
  } catch (error: any) {
    return error
  }
}

export const generateInvoiceNumber = () => {
  return `PUSH-${Math.floor(Math.random() * 1000000000)}`
}
