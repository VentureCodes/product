import { RateCategory } from './rateCategory'
import { Ad } from './ad'
import { Response } from './api'
import { Coin } from './coin'
import { Country } from './country'
import { Fiat } from './fiat'
import { Network } from './network'
import { PaymentMethod } from './paymentMethod'
import { Rate } from './rate'
import { RateProvider } from './rateProvider'
import { Transaction, TransactionCreateResponse } from './transaction'
import { User } from './user'
import { Otp } from './otp'
import { AuthResponse } from './auth'
import { FiatWallet, AllowedTokensResponse } from './fiat-wallet'
import { Post } from './post'
import { News } from './news'
import { Trader } from './trader'
import { Strategy } from './strategy'
import { Contact } from './contact'
import { PerformanceHistory } from './performanceHistory'
import { MonthlyPerformance } from './monthlyPerformance'
import {
  CoinMarketCapQuoteList,
  CoinMarketCapQuoteListItem,
  CoinMarketCapTimePeriod,
  CoinMarketCapCoin,
  CoinMarketCapTokenTypes,
  GetTrendingLatestResponse,
  GetTrendingLatestParams,
  GetKeyInfoResponse,
  GainerAndLooserCurrency,
  CoinMarketCapMarketItem,
} from './marketCapGainerAndLoser'
import { FiatTransaction } from './fiat-transaction'
import { PaymentLine } from './payment-line'
import { SubscriptionPlan } from './subscription'
import { CryptoAccount } from './crypto-account'
import { CryptoWallet } from './crypto-wallet'
import { Saving } from './saving'
import { CurrencyRate } from './currencyRate'
import { CryptoRate } from './CryptoRate'
import { CopyTrade, CopyTradeResponse, TradingFee } from './copy-trade'
import { Notification } from './notification'
import { TradeInformation } from './tradeInformation'
import { Shill } from './shill'
import { CryptocurrencyType } from './CoinMarketCap'
import { PushPayResponse, PushPayClaimResponse } from './push-pay'
import { Feed } from './feed'
import { Comment } from './comment'
import { Reaction } from './reaction'
import { Category } from './category'
import { Referral, CreateReferralPayload } from './referral'
import { ReferralUsage } from './referralUsage'
import { BuySellResponse } from './buySell'
import {
  CryptoTransaction,
  CryptoTokenPrice,
} from './crypto-wallet-transactions'
import { mpesaDepositResponse, mpesaWithdrawResponse } from './mpesa'
import { ApiKey } from './rates-api-key'
import { ApiKeyUsage } from './rates-api-usage'
import { Trade } from './trade'
import { KlineData } from './kline'
import { WithdrawCryptoResponse, WithdrawCryptoResult } from './withdrawCrypto'

export const $Model = {
  Country,
  Fiat,
  Rate,
  RateProvider,
  RateCategory,
  Coin,
  Network,
  PaymentMethod,
  User,
  Ad,
  Transaction,
  TransactionCreateResponse,
  Response,
  Otp,
  AuthResponse,
  FiatWallet,
  Shill,
  Post,
  News,
  Trader,
  Strategy,
  Contact,
  PerformanceHistory,
  MonthlyPerformance,

  //Market Cap Gainers and Looser

  CoinMarketCapQuoteList,
  CoinMarketCapQuoteListItem,
  CoinMarketCapTimePeriod,
  CoinMarketCapCoin,
  CoinMarketCapTokenTypes,
  GetTrendingLatestResponse,
  GetTrendingLatestParams,
  GetKeyInfoResponse,
  GainerAndLooserCurrency,
  CoinMarketCapMarketItem,
  PaymentLine,
  FiatTransaction,
  SubscriptionPlan,
  CryptoAccount,
  CryptoWallet,
  Saving,
  CurrencyRate,
  CryptoRate,
  CopyTrade,
  Notification,
  CopyTradeResponse,
  AllowedTokensResponse,
  TradeInformation,
  CryptocurrencyType,
  PushPayResponse,
  PushPayClaimResponse,
  TradingFee,

  // Feed
  Feed,
  Comment,
  Reaction,
  Category,

  Referral,
  ReferralUsage,
  CreateReferralPayload,

  // Buy Now
  BuySellResponse,

  // Crypto Transactions
  CryptoTransaction,
  CryptoTokenPrice,

  // Mpesa
  mpesaDepositResponse,
  mpesaWithdrawResponse,

  // rates API
  ApiKey,
  ApiKeyUsage,

  //Trading
  Trade,

  //Kline
  KlineData,

  //Withdraw Crypto
  WithdrawCryptoResponse,
  WithdrawCryptoResult,
}
