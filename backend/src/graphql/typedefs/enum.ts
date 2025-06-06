import { enumType } from 'nexus'
import {
  CoinStatus,
  Side,
  TransactionStatus,
  TransactionType,
  TransactionDirection,
  TransactionInfo,
  OtpType,
  PostStatus,
  PostCategory,
  PostTopic,
  TradingStyle,
  Platform,
  RiskLevel,
  Month,
  SubscriptionType,
  SubscriptionPackage,
  WalletStatus,
  SavingDuration,
  WalletType,
  CopyStatus,
  ReactionType,
  HoldingStatus,
  UserType,
  NotificationStatus,
  OrderSide,
  NotificationCategory,
  NotificationType,
} from 'nexus-prisma'

export const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

export const PushPaymentMethod = enumType({
  name: 'PushPaymentMethod',
  members: ['mpesa', 'card', 'wallet', 'crypto', 'momo'],
})

export const WalletRequestAction = enumType({
  name: 'WalletRequestAction',
  members: ['deposit', 'withdraw'],
})

export const $Enum = {
  SortOrder,
  OtpType: enumType(OtpType),
  UsetType: enumType(UserType),
  ReactionType: enumType(ReactionType),
  SubscriptionType: enumType(SubscriptionType),
  SubscriptionPawckage: enumType(SubscriptionPackage),
  CoinStatus: enumType(CoinStatus),
  Side: enumType(Side),
  TransactionStatus: enumType(TransactionStatus),
  TransactionType: enumType(TransactionType),
  TransactionDirection: enumType(TransactionDirection),
  TransactionInfo: enumType(TransactionInfo),
  PostStatus: enumType(PostStatus),
  PostCategory: enumType(PostCategory),
  PostTopic: enumType(PostTopic),
  TradingStyle: enumType(TradingStyle),
  Platform: enumType(Platform),
  RiskLevel: enumType(RiskLevel),
  Month: enumType(Month),
  WalletStatus: enumType(WalletStatus),
  WalletType: enumType(WalletType),
  SavingDuration: enumType(SavingDuration),
  CopyStatus: enumType(CopyStatus),
  NotificationStatus: enumType(NotificationStatus),
  PushPaymentMethod,
  HoldingStatus: enumType(HoldingStatus),
  WalletRequestAction,
  OrderSide: enumType(OrderSide),
  NotificationCategory: enumType(NotificationCategory),
  NotificationType: enumType(NotificationType),
}
