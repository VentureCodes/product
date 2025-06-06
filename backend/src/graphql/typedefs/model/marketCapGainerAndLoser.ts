import { objectType, enumType, inputObjectType } from 'nexus'

export const CoinMarketCapQuoteList = objectType({
  name: 'CoinMarketCapQuoteList',
  definition(t) {
    t.field('usd', { type: 'Float' })
  },
})

export const CoinMarketCapQuoteListItem = objectType({
  name: 'CoinMarketCapQuoteListItem',
  definition(t) {
    t.string('id')
    t.float('usd')
  },
})

export const CoinMarketCapTimePeriod = enumType({
  name: 'CoinMarketCapTimePeriod',
  members: {
    ONE_HOUR: '1h',
    TWENTY_FOUR_HOURS: '24h',
    SEVEN_DAYS: '7d',
    THIRTY_DAYS: '30d',
  },
})

export const CoinMarketCapMarketItem = objectType({
  name: 'CoinMarketCapMarketItem',
  definition(t) {
    t.string('id')
    t.string('symbol')
    t.string('name')
    t.string('image')
    t.float('current_price')
    t.float('market_cap')
    t.int('market_cap_rank')
    t.nullable.float('fully_diluted_valuation')
    t.float('total_volume')
    t.nullable.float('high_24h')
    t.nullable.float('low_24h')
    t.nullable.float('price_change_24h')
    t.nullable.float('price_change_percentage_24h')
    t.nullable.float('market_cap_change_24h')
    t.nullable.float('market_cap_change_percentage_24h')
    t.float('circulating_supply')
    t.nullable.float('total_supply')
    t.nullable.float('max_supply')
    t.float('ath')
    t.float('ath_change_percentage')
    t.string('ath_date')
    t.float('atl')
    t.float('atl_change_percentage')
    t.string('atl_date')
    t.field('roi', {
      type: objectType({
        name: 'Roi',
        definition(t) {
          t.float('times')
          t.string('currency')
          t.float('percentage')
        },
      }),
    })
    t.string('last_updated')
  },
})

export const CoinMarketCapCoin = objectType({
  name: 'CoinMarketCapCoin',
  definition(t) {
    t.string('id')
    t.string('symbol')
    t.string('name')
  },
})

export const CoinMarketCapTokenTypes = objectType({
  name: 'CoinMarketCapTokenTypes',
  definition(t) {
    t.field('status', {
      type: objectType({
        name: 'TokenTypeStatus',
        definition(t) {
          t.string('timestamp')
          t.int('error_code')
          t.nullable.string('error_message')
          t.int('elapsed')
          t.int('credit_count')
          t.nullable.string('notice')
        },
      }),
    })
    t.list.field('data', {
      type: objectType({
        name: 'TokenData',
        definition(t) {
          t.int('id')
          t.string('name')
          t.string('symbol')
          t.string('slug')
          t.int('num_market_pairs')
          t.string('date_added')
          t.list.string('tags')
          t.nullable.float('max_supply')
          t.float('circulating_supply')
          t.float('total_supply')
          t.int('is_active')
          t.boolean('infinite_supply')
          t.nullable.field('platform', {
            type: objectType({
              name: 'TokenPlatform',
              definition(t) {
                t.int('id')
                t.string('name')
                t.string('symbol')
                t.string('slug')
                t.string('token_address')
              },
            }),
          })
          t.int('cmc_rank')
          t.int('is_fiat')
          t.nullable.float('self_reported_circulating_supply')
          t.nullable.float('self_reported_market_cap')
          t.nullable.float('tvl_ratio')
          t.string('last_updated')
          t.field('quote', {
            type: objectType({
              name: 'Quote',
              definition(t) {
                t.field('USD', {
                  type: objectType({
                    name: 'USDQuote',
                    definition(t) {
                      t.float('price')
                      t.float('volume_24h')
                      t.float('volume_change_24h')
                      t.float('percent_change_1h')
                      t.float('percent_change_24h')
                      t.float('percent_change_7d')
                      t.float('percent_change_30d')
                      t.float('market_cap')
                      t.float('market_cap_dominance')
                      t.float('fully_diluted_market_cap')
                      t.string('last_updated')
                    },
                  }),
                })
              },
            }),
          })
        },
      }),
    })
  },
})

export const GetTrendingLatestResponse = objectType({
  name: 'GetTrendingLatestResponse',
  definition(t) {
    t.field('status', {
      type: objectType({
        name: 'TrendingLatestStatus',
        definition(t) {
          t.string('timestamp')
          t.int('error_code')
          t.nullable.string('error_message')
          t.int('elapsed')
          t.int('credit_count')
          t.nullable.string('notice')
          t.int('total_count')
        },
      }),
    })
    t.list.field('data', {
      type: objectType({
        name: 'TrendingData',
        definition(t) {
          t.int('id')
          t.string('name')
          t.string('symbol')
          t.string('slug')
          t.int('num_market_pairs')
          t.string('date_added')
          t.list.string('tags')
          t.nullable.float('max_supply')
          t.float('circulating_supply')
          t.float('total_supply')
          t.int('is_active')
          t.boolean('infinite_supply')
          t.nullable.field('platform', {
            type: objectType({
              name: 'TrendingPlatform',
              definition(t) {
                t.int('id')
                t.string('name')
                t.string('symbol')
                t.string('slug')
                t.string('token_address')
              },
            }),
          })
          t.int('cmc_rank')
          t.int('is_fiat')
          t.nullable.float('self_reported_circulating_supply')
          t.nullable.float('self_reported_market_cap')
          t.nullable.float('tvl_ratio')
          t.string('last_updated')
          t.field('quote', {
            type: objectType({
              name: 'TrendingQuote',
              definition(t) {
                t.field('USD', {
                  type: objectType({
                    name: 'TrendingUSDQuote',
                    definition(t) {
                      t.float('price')
                      t.float('volume_24h')
                      t.float('volume_change_24h')
                      t.float('percent_change_1h')
                      t.float('percent_change_24h')
                      t.float('percent_change_7d')
                      t.float('percent_change_30d')
                      t.float('percent_change_60d')
                      t.float('percent_change_90d')
                      t.float('market_cap')
                      t.float('market_cap_dominance')
                      t.float('fully_diluted_market_cap')
                      t.nullable.float('tvl')
                      t.string('last_updated')
                    },
                  }),
                })
              },
            }),
          })
        },
      }),
    })
  },
})

export const GetTrendingLatestParams = inputObjectType({
  name: 'GetTrendingLatestParams',
  definition(t) {
    t.nullable.int('start')
    t.nullable.int('limit')
    t.nullable.field('time_period', { type: CoinMarketCapTimePeriod })
    t.nullable.string('convert')
    t.nullable.string('convert_id')
  },
})

export const GetKeyInfoResponse = objectType({
  name: 'GetKeyInfoResponse',
  definition(t) {
    t.field('status', {
      type: objectType({
        name: 'GetKeyInfoStatus',
        definition(t) {
          t.string('timestamp')
          t.int('error_code')
          t.nullable.string('error_message')
          t.int('elapsed')
          t.int('credit_count')
          t.nullable.string('notice')
        },
      }),
    })
    t.field('data', {
      type: objectType({
        name: 'KeyInfoData',
        definition(t) {
          t.field('plan', {
            type: objectType({
              name: 'Plan',
              definition(t) {
                t.int('credit_limit_monthly')
                t.string('credit_limit_monthly_reset')
                t.string('credit_limit_monthly_reset_timestamp')
                t.int('rate_limit_minute')
              },
            }),
          })
          t.field('usage', {
            type: objectType({
              name: 'Usage',
              definition(t) {
                t.field('current_minute', {
                  type: objectType({
                    name: 'CurrentMinute',
                    definition(t) {
                      t.int('requests_made')
                      t.int('requests_left')
                    },
                  }),
                })
                t.field('current_day', {
                  type: objectType({
                    name: 'CurrentDay',
                    definition(t) {
                      t.int('credits_used')
                    },
                  }),
                })
                t.field('current_month', {
                  type: objectType({
                    name: 'CurrentMonth',
                    definition(t) {
                      t.int('credits_used')
                      t.int('credits_left')
                    },
                  }),
                })
              },
            }),
          })
        },
      }),
    })
  },
})

export const GainerAndLooserCurrency = objectType({
  name: 'GainerAndLooserCurrency',
  definition(t) {
    t.string('name')
    t.string('symbol')
    t.float('circulating_supply')
    t.float('total_supply')
    t.nullable.float('max_supply')
    t.int('cmc_rank')
    t.float('price')
    t.float('volume_24h')
    t.float('market_cap')
    t.float('percent_change_1h')
    t.float('percent_change_24h')
    t.float('percent_change_7d')
    t.float('percent_change_30d')
  },
})
