
import { objectType } from 'nexus'

export const CryptocurrencyType = objectType({
    name: 'Cryptocurrency',
    definition(t) {
      t.string('name');
      t.string('symbol');
      t.float('circulating_supply');
      t.float('total_supply');
      t.float('max_supply');
      t.int('cmc_rank');
      t.float('price');
      t.float('volume_24h');
      t.float('market_cap');
      t.float('percent_change_1h');
      t.float('percent_change_24h');
      t.float('percent_change_7d');
      t.float('percent_change_30d');
    },
  });