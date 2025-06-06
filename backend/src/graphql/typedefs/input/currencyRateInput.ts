import { inputObjectType } from "nexus"

export const CurrencyRateInput = inputObjectType({
    name: 'CurrencyRateInput',
    definition(t) {
        t.nonNull.string('base_currency')
        t.nonNull.string('value')
        t.nonNull.string('currency')
    },
})