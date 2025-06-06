import { inputObjectType } from "nexus"

export const CryptoRateInput = inputObjectType({
    name: 'CryptoRateInput',
    definition(t) {
        t.nonNull.string('currency')
    },
})