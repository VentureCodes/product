import {
  AdCreateInput,
  AdOrderByInput,
  AdUpdateInput,
  AdWhereInput,
  AdWhereUniqueInput,
  CoinCreateInput,
  CoinOrderByInput,
  CoinUpdateInput,
  CoinWhereInput,
  CoinWhereUniqueInput,
  CountryCreateInput,
  CountryOrderByInput,
  CountryUpdateInput,
  CountryWhereInput,
  CountryWhereUniqueInput,
  FiatCreateInput,
  FiatOrderByInput,
  FiatUpdateInput,
  FiatWhereInput,
  FiatWhereUniqueInput,
  NetworkCreateInput,
  NetworkOrderByInput,
  NetworkUpdateInput,
  NetworkWhereInput,
  NetworkWhereUniqueInput,
  PaymentMethodCreateInput,
  PaymentMethodOrderByInput,
  PaymentMethodUpdateInput,
  PaymentMethodWhereInput,
  PaymentMethodWhereUniqueInput,
  PaymentMethodsInput,
  TransactionCreateInput,
  TransactionOrderByInput,
  TransactionUpdateInput,
  TransactionWhereInput,
  TransactionWhereUniqueInput,
  UserWhereUniqueInput,
} from './ip2p'
import {
  RateCreateInput,
  RateOrderByInput,
  RateUpdateInput,
  RateWhereInput,
  RateWhereUniqueInput,
} from './rate'
import {
  RateCategoryCreateInput,
  RateCategoryOrderByInput,
  RateCategoryUpdateInput,
  RateCategoryWhereInput,
  RateCategoryWhereUniqueInput,
} from './rateCategory'
import {
  RateProviderCreateInput,
  RateProviderOrderByInput,
  RateProviderUpdateInput,
  RateProviderWhereInput,
  RateProviderWhereUniqueInput,
} from './rateProvider'
import {
  AuthInput,
  UserOtpInput,
  UserRegisterInput,
  UserUpdateInput,
  UserOrderByInput,
  UserWhereInput,
} from './user'
import {
  LoadFiatWalletWithCardInput,
  LoadFiatWalletWithMpesaInput,
  FiatTransactionWhereInput,
  FiatTransactionOrderByInput,
  FiatWalletSendMoneyInput,
  GetFiatTransaction,
} from './payment'

import {
  SavingCreateInput,
  SavingOrderByInput,
  SavingWhereUniqueInput,
} from './saving'

import {
  PostCreateInput,
  PostOrderByInput,
  PostUpdateInput,
  PostWhereInput,
  PostWhereUniqueInput,
} from './workOnline'

import {
  NotificationWhereUniqueInput,
  NotificationWhereInput,
  NotificationWhereOrderByInput,
  UpdateNotificationType,
} from './notification'
import {
  TradeInformationWhereUniqueInput,
  TradeInformationCreateInput,
  TradeInformationOrderByInput,
  TradeInformationUpdateInput,
  TradeInformationWhereInput,
} from './tradeInformation'
import { SubscriptionInput, FilterPaymentMethod } from './subscription'

import {
  KlineDataOrderByInput,
  KlineDataWhereUniqueInput,
  KlineDataWhereInput,
} from './kline'

import {
  TradeWhereUniqueInput,
  TradeOrderByInput,
  TradeWhereInput,
} from './trade'
// import {
//   TraderWhereUniqueInput,
//   TraderOrderByInput,
//   TraderCreateInput,
//   TraderUpdateInput,
//   StrategyCreateInput,
//   StrategyUpdateInput,
//   StrategyOrderByInput,
//   ContactCreateInput,
//   ContactUpdateInput,
//   PerformanceHistoryCreateInput,
//   MonthlyPerformanceCreateInput,
//   MonthlyPerformanceUpdateInput,
//   MonthlyPerformanceOrderByInput,
//   PerformanceHistoryOrderByInput,
//   PerformanceHistoryUpdateInput,
// } from './trader'

import {
  ShillWhereInput,
  ShillWhereUniqueInput,
  ShillOrderByInput,
  ShillCreateInput,
  ShillUpdateInput,
  StrategyCreateInput,
  StrategyUpdateInput,
  StrategyOrderByInput,
  ContactCreateInput,
  ContactUpdateInput,
  PerformanceHistoryCreateInput,
  MonthlyPerformanceCreateInput,
  MonthlyPerformanceUpdateInput,
  MonthlyPerformanceOrderByInput,
  PerformanceHistoryOrderByInput,
  PerformanceHistoryUpdateInput,
} from './shill'
import { GainerAndLooserOrderByInput } from './coinMarketCap'
import { CurrencyRateInput } from './currencyRateInput'
import {
  CopyTradeWhereInput,
  CopyTradeWhereOrderByInput,
  // TraderWhereInput,
  WithdrawCryptoInput,
  SwapTokenInput,
  ShillWhereOrderByInput,
  CopyTradeWhereUniqueInput,
  CopyStatusInput,
} from './copy-trade'

import {
  PushPayWhereInput,
  PushPayClaimWhereInput,
  PushPayPullWhereInput,
} from './pushpay'

import {
  CommentInput,
  FeedCommentInput,
  FeedOrderByInput,
  FeedReactInput,
  FeedWhereInput,
  FeedWhereUniqueInput,
  ReactOnCommentInput,
} from './feed'

import {
  ReferralWhereUniqueInput,
  ReferralCreateInput,
  ReferralOrderByInput,
  ReferralWhereInput,
  ReferralUsageWhereInput,
  ReferralUsageWhereUniqueInput,
} from './referral'

import { BuySellWhereInput } from './buySell'
import {
  WalletLoadWhereInput,
  CompleteWalletLoadWhereInput,
} from './loadWallet'

import {
  CryptoTransactionWhereUniqueInput,
  CryptoTransactionWhereInput,
  CryptoTransactionOrderByInput,
  CryptoTransactionCreateInput,
  CryptoTransactionStatusUpdateInput,
  SwapCryptoTransactionCreateInput,
  GetTokenPriceInput,
} from './crypto-wallet-transactions'

import { MpesaDepositWhereInput, MpesaWithdrawWhereInput } from './mpesa'

import {
  ApiKeyWhereUniqueInput,
  ApiKeyWhereInput,
  ApiKeyOrderByInput,
  ApiKeyCreateInput,
  ApiKeyUpdateInput,
} from './rates-api-key'

import {
  ApiKeyUsageWhereUniqueInput,
  ApiKeyUsageWhereInput,
  ApiKeyUsageOrderByInput,
  ApiKeyUsageCreateInput,
  ApiKeyUsageUpdateInput,
} from './rates-api-usage'

export const $Input = {
  UserWhereUniqueInput,
  CountryWhereUniqueInput,
  CountryCreateInput,
  CountryUpdateInput,
  CountryWhereInput,
  CountryOrderByInput,
  FiatWhereUniqueInput,
  FiatCreateInput,
  FiatUpdateInput,
  FiatWhereInput,
  FiatOrderByInput,
  AdWhereUniqueInput,
  AdCreateInput,
  AdUpdateInput,
  AdWhereInput,
  AdOrderByInput,
  PaymentMethodWhereUniqueInput,
  PaymentMethodWhereInput,
  PaymentMethodCreateInput,
  PaymentMethodsInput,
  PaymentMethodUpdateInput,
  PaymentMethodOrderByInput,
  CoinWhereUniqueInput,
  CoinWhereInput,
  CoinCreateInput,
  CoinUpdateInput,
  CoinOrderByInput,
  NetworkWhereUniqueInput,
  NetworkWhereInput,
  NetworkCreateInput,
  NetworkUpdateInput,
  NetworkOrderByInput,
  TransactionWhereUniqueInput,
  TransactionWhereInput,
  TransactionCreateInput,
  TransactionUpdateInput,
  TransactionOrderByInput,

  // Rate
  RateWhereUniqueInput,
  RateWhereInput,
  RateCreateInput,
  RateUpdateInput,
  RateOrderByInput,
  CurrencyRateInput,

  // Rate category
  RateCategoryCreateInput,
  RateCategoryUpdateInput,
  RateCategoryWhereInput,
  RateCategoryWhereUniqueInput,
  RateCategoryOrderByInput,

  // Rate provider
  RateProviderCreateInput,
  RateProviderOrderByInput,
  RateProviderUpdateInput,
  RateProviderWhereInput,
  RateProviderWhereUniqueInput,
  AuthInput,
  UserRegisterInput,
  UserUpdateInput,
  UserOtpInput,
  UserOrderByInput,
  UserWhereInput,
  LoadFiatWalletWithCardInput,
  LoadFiatWalletWithMpesaInput,

  // Work online
  FiatTransactionWhereInput,
  FiatTransactionOrderByInput,
  FiatWalletSendMoneyInput,
  GetFiatTransaction,
  PostWhereUniqueInput,
  PostOrderByInput,

  PostCreateInput,
  PostUpdateInput,

  PostWhereInput,

  // Trade Information
  TradeInformationWhereUniqueInput,
  TradeInformationCreateInput,
  TradeInformationOrderByInput,
  TradeInformationUpdateInput,
  TradeInformationWhereInput,

  //trader
  // TraderWhereInput,
  // TraderWhereUniqueInput,
  // TraderOrderByInput,
  // TraderCreateInput,
  // TraderUpdateInput,
  // StrategyCreateInput,
  // StrategyUpdateInput,
  // StrategyOrderByInput,
  // ContactCreateInput,
  // ContactUpdateInput,
  // PerformanceHistoryCreateInput,
  // MonthlyPerformanceCreateInput,
  // MonthlyPerformanceUpdateInput,
  // MonthlyPerformanceOrderByInput,
  // PerformanceHistoryOrderByInput,
  // PerformanceHistoryUpdateInput,

  // Shill
  ShillWhereInput,
  ShillWhereUniqueInput,
  ShillOrderByInput,
  ShillCreateInput,
  ShillUpdateInput,
  StrategyCreateInput,
  StrategyUpdateInput,
  StrategyOrderByInput,
  ContactCreateInput,
  ContactUpdateInput,
  PerformanceHistoryCreateInput,
  MonthlyPerformanceCreateInput,
  MonthlyPerformanceUpdateInput,
  MonthlyPerformanceOrderByInput,
  PerformanceHistoryOrderByInput,
  PerformanceHistoryUpdateInput,

  //gainers and looser coinmarketcap
  GainerAndLooserOrderByInput,
  SubscriptionInput,
  FilterPaymentMethod,
  // Saving
  SavingCreateInput,
  SavingOrderByInput,
  SavingWhereUniqueInput,
  // copy trading
  CopyTradeWhereInput,
  WithdrawCryptoInput,
  CopyStatusInput,
  SwapTokenInput,
  CopyTradeWhereOrderByInput,
  ShillWhereOrderByInput,
  CopyTradeWhereUniqueInput,

  // pushpay
  PushPayWhereInput,
  PushPayClaimWhereInput,
  PushPayPullWhereInput,
  // Feeds
  CommentInput,
  FeedCommentInput,
  FeedOrderByInput,
  FeedReactInput,
  FeedWhereInput,
  FeedWhereUniqueInput,
  ReactOnCommentInput,

  // Referral
  ReferralCreateInput,
  ReferralWhereUniqueInput,
  ReferralOrderByInput,
  ReferralWhereInput,
  ReferralUsageWhereInput,
  ReferralUsageWhereUniqueInput,

  // Buy Now
  BuySellWhereInput,

  // V1 Load Wallet
  WalletLoadWhereInput,
  CompleteWalletLoadWhereInput,
  // Crypto Transactions
  CryptoTransactionWhereUniqueInput,
  CryptoTransactionWhereInput,
  CryptoTransactionOrderByInput,
  CryptoTransactionCreateInput,
  CryptoTransactionStatusUpdateInput,
  SwapCryptoTransactionCreateInput,
  GetTokenPriceInput,

  // Mpesa
  MpesaDepositWhereInput,
  MpesaWithdrawWhereInput,

  // Rates API
  ApiKeyWhereUniqueInput,
  ApiKeyWhereInput,
  ApiKeyOrderByInput,
  ApiKeyCreateInput,
  ApiKeyUpdateInput,

  //api usage
  ApiKeyUsageWhereUniqueInput,
  ApiKeyUsageWhereInput,
  ApiKeyUsageOrderByInput,
  ApiKeyUsageCreateInput,
  ApiKeyUsageUpdateInput,

  //Notification
  NotificationWhereUniqueInput,
  NotificationWhereInput,
  NotificationWhereOrderByInput,
  UpdateNotificationType,

  //Trade
  TradeWhereUniqueInput,
  TradeOrderByInput,
  TradeWhereInput,

  //Kline
  KlineDataOrderByInput,
  KlineDataWhereUniqueInput,
  KlineDataWhereInput,
}
