import { AdMutation, AdQuery } from './ad'
import { CoinMutation, CoinQuery } from './coin'
import { CountryMutation, CountryQuery } from './country'
import { FiatMutation, FiatQuery } from './fiat'
import { NetworkMutation, NetworkQuery } from './network'
import { PaymentMethodMutation, PaymentMethodQuery } from './paymentMethod'
import { RateMutation, RateQuery } from './rate'
import { RateCategoryMutation, RateCategoryQuery } from './rateCategory'
import { RateProviderMutation, RateProviderQuery } from './rateProvider'
import { TransactionMutation, TransactionQuery } from './transaction'
import { UserMutation, UserQuery } from './user'
import { PostQuery, PostMutation } from './workOnline'
import { NewsQuery } from './news'
import { TraderQuery, TraderMutation } from './trader'
import { GainerAndLoserQuery } from './gainerAndLooser'
import { FiatWalletMutation, FiatWallletQuery } from './fiat-wallet'
import { SubscriptionMutation, SubscriptionQuery } from './subscription'
import { SavingMutation, SavingQuery } from './saving'
import { CurrencyRateQuery } from './currencyRate'
import { CopyTradeQuery, CopyTradeMutation } from './copy-trade'
import {
  TradeInformationMutation,
  TradeInformationQuery,
} from './tradeInformation'
import {
  PushPayMutation,
  PushPayQuery,
  PushPayPullMutation,
  PushPayPullQuery,
  PushClaimPayQuery,
  PushPayClaimMutation,
} from './pushpay'

import { NotificationQuery, NotificationMutation } from './notification'

import { FeedQuery, FeedMutation } from './feeds'
import { ReferralQuery } from './referral'

import { BuySellMutation } from './buySell'
import { TradeQuery, TradeMutation } from './trade'
import {
  CryptoTransactionMutation,
  CryptoTransactionQuery,
} from './crypto-wallet-transactions'
import { ApiKeyMutation, ApiKeyQuery } from './rates-api-key'
import { ApiKeyUsageQuery } from './rates-api-usage'
import { KlineDataQuery } from './kline'

import { mpesaDeposit } from './mpesa/mpesaDeposit'
import { mpesaWithdraw } from './mpesa/mpesaWithdraw'

export const $Query = {
  CountryQuery,
  FiatQuery,
  CoinQuery,
  NetworkQuery,
  PaymentMethodQuery,
  AdQuery,
  TransactionQuery,
  RateQuery,
  FiatWallletQuery,
  RateCategoryQuery,
  RateProviderQuery,
  UserQuery,
  PostQuery,
  NewsQuery,
  TraderQuery,
  GainerAndLoserQuery,
  SubscriptionQuery,
  SavingQuery,
  CurrencyRateQuery,
  CopyTradeQuery,
  TradeInformationQuery,
  PushPayQuery,
  PushPayPullQuery,
  PushClaimPayQuery,
  FeedQuery,
  ReferralQuery,
  CryptoTransactionQuery,
  ApiKeyQuery,
  ApiKeyUsageQuery,
  NotificationQuery,
  TradeQuery,
  KlineDataQuery,
}
export const $Mutation = {
  CountryMutation,
  FiatMutation,
  CoinMutation,
  NetworkMutation,
  PaymentMethodMutation,
  AdMutation,
  TransactionMutation,
  RateMutation,
  UserMutation,
  FiatWalletMutation,
  PostMutation,
  RateCategoryMutation,
  RateProviderMutation,
  TraderMutation,
  SubscriptionMutation,
  SavingMutation,
  CopyTradeMutation,
  TradeInformationMutation,
  PushPayMutation,
  PushPayPullMutation,
  PushPayClaimMutation,
  FeedMutation,
  BuySellMutation,
  CryptoTransactionMutation,
  // ReferralMutation,
  TradeMutation,
  ApiKeyMutation,
  mpesaDeposit,
  mpesaWithdraw,
  NotificationMutation,
}
