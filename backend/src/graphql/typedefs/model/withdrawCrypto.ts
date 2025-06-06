import { objectType } from 'nexus'
import { CryptoTransaction } from './crypto-wallet-transactions'


export const WithdrawCryptoResponse = objectType({
    name: 'WithdrawCryptoResponse',
    definition(t) {
        t.string('status')
        t.string('msg')
        t.string('fee')
        t.string('netAmount')
    },
    })

    export const WithdrawCryptoResult = objectType({
        name: 'WithdrawCryptoResult',
        definition(t) {
            t.nonNull.field('transaction', { type: CryptoTransaction })
            t.nonNull.field('response', { type: WithdrawCryptoResponse })
        },
    })