import { objectType } from 'nexus'


export const UpdateTime = objectType({
    name: 'UpdateTime',
    definition(t) {
        t.string('last_updated_at');
    },
});


const CurrencyData = objectType({
    name: 'CurrencyData',
    definition(t) {
        t.string('code');
        t.float('value');
    },
});


export const CurrencyRate = objectType({
    name: 'CurrencyRate',
    description: 'Currency rate object',
    definition: (t) => {
        t.field('meta', { type: UpdateTime });
        t.field('data', { type: CurrencyData });
    }
})

