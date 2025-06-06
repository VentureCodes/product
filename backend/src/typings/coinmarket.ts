export type CoinMarketCapQuoteList = Record<string, { usd: number }>
export type CoinMarketCapQuoteListItem = { id: string; usd: number }

export enum CoinMarketCapTimePeriod {
  Hour = '1h',
  Day = '24h',
  Week = '7d',
  Month = '30d',
}

export interface CoinMarketCapMarketItem {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation?: number
  total_volume: number
  high_24h?: number
  low_24h?: number
  price_change_24h?: number
  price_change_percentage_24h?: number
  market_cap_change_24h?: number
  market_cap_change_percentage_24h?: number
  circulating_supply: number
  total_supply?: number
  max_supply?: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: {
    times: number
    currency: string
    percentage: number
  }
  last_updated: string
}

export interface CoinMarketCapCoin {
  id: string
  symbol: string
  name: string
}

export interface CoinMarketCapTokenTypes {
  status: {
    timestamp: string
    error_code: number
    error_message: null | string
    elapsed: number
    credit_count: number
    notice: null | string
  }
  data: Array<{
    id: number
    name: string
    symbol: string
    slug: string
    num_market_pairs: number
    date_added: string
    tags: string[]
    max_supply: null | number
    circulating_supply: number
    total_supply: number
    is_active: number
    infinite_supply: boolean
    platform: {
      id: number
      name: string
      symbol: string
      slug: string
      token_address: string
    }
    cmc_rank: number
    is_fiat: number
    self_reported_circulating_supply: null | number
    self_reported_market_cap: null | number
    tvl_ratio: null | number
    last_updated: string
    quote: {
      [key: string]: {
        price: number
        volume_24h: number
        volume_change_24h: number
        percent_change_1h: number
        percent_change_24h: number
        percent_change_7d: number
        percent_change_30d: number
        market_cap: number
        market_cap_dominance: number
        fully_diluted_market_cap: number
        last_updated: string
      }
    }
  }>
}

export type GetTrendingLatestResponse = {
  status: {
    timestamp: string
    error_code: number
    error_message: any
    elapsed: number
    credit_count: number
    notice: any
    total_count: number
  }
  data: Array<{
    id: number
    name: string
    symbol: string
    slug: string
    num_market_pairs: number
    date_added: string
    tags: Array<string>
    max_supply?: number
    circulating_supply: number
    total_supply: number
    is_active: number
    infinite_supply: boolean
    platform?: {
      id: number
      name: string
      symbol: string
      slug: string
      token_address: string
    }
    cmc_rank: number
    is_fiat: number
    self_reported_circulating_supply?: number
    self_reported_market_cap?: number
    tvl_ratio: any
    last_updated: string
    quote: {
      USD: {
        price: number
        volume_24h: number
        volume_change_24h: number
        percent_change_1h: number
        percent_change_24h: number
        percent_change_7d: number
        percent_change_30d: number
        percent_change_60d: number
        percent_change_90d: number
        market_cap: number
        market_cap_dominance: number
        fully_diluted_market_cap: number
        tvl: any
        last_updated: string
      }
    }
  }>
}

export type GetTrendingLatestParams = {
  start?: number
  limit?: number
  time_period?: '24h' | '30d' | '7d'
  convert?: string
  convert_id?: string
}

export type GetKeyInfoResponse = {
  status: {
    timestamp: string
    error_code: number
    error_message: any
    elapsed: number
    credit_count: number
    notice: any
  }
  data: {
    plan: {
      credit_limit_monthly: number
      credit_limit_monthly_reset: string
      credit_limit_monthly_reset_timestamp: string
      rate_limit_minute: number
    }
    usage: {
      current_minute: {
        requests_made: number
        requests_left: number
      }
      current_day: {
        credits_used: number
      }
      current_month: {
        credits_used: number
        credits_left: number
      }
    }
  }
}

export interface Cryptocurrency {
  name: string
  symbol: string
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  cmc_rank: number
  price: number
  volume_24h: number
  market_cap: number
  percent_change_1h: number
  percent_change_24h: number
  percent_change_7d: number
  percent_change_30d: number
}
