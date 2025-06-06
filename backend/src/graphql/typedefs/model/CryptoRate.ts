import { objectType } from "nexus";
import { UpdateTime } from "./currencyRate";

const CryptoData = objectType({
    name: 'CryptoData',
    definition(t) {
        t.float('value');
    },

});


const Crypto = objectType({
    name: 'Crypto',
    definition(t) {
        t.field('BTC', { type: CryptoData });
        t.field('ETH', { type: CryptoData });
        t.field('BNB', { type: CryptoData });
        t.field('SOL', { type: CryptoData });
    },
})

export const CryptoRate = objectType({
    name: 'CryptoRate',
    definition(t) {
        t.field('meta', { type: UpdateTime });
        t.field('data', { type: Crypto });
    },
});
