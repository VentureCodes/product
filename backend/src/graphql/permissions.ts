import { or, rule, shield } from 'graphql-shield'

const rules = {
  isAuthenticatedUser: rule({ cache: 'contextual' })(
    (_, __, { user }) => Object.keys(user || {}).length > 0,
  ),

  isAdmin: rule({ cache: 'contextual' })(
    (_, __, { user }) => user.role === 'ADMIN',
  ),

  isCashier: rule({ cache: 'contextual' })(
    (_, __, { user }) => user.role === 'CASHIER',
  ),

  isEditor: rule({ cache: 'contextual' })(
    (_, __, { user }) => user.role === 'EDITOR',
  ),

  isAdvertiser: rule({ cache: 'contextual' })(
    (_, __, { user }) => user.role === 'ADVERTISER',
  ),
}

export const permissions = shield(
  {
    Query: {
      currentUser: rules.isAuthenticatedUser,
      fiatWallet: rules.isAuthenticatedUser,
      myCryptoWallet: rules.isAuthenticatedUser,

      mySubscriptionPlans: rules.isAuthenticatedUser,
      users: rules.isAuthenticatedUser,
      fiatTransactions: rules.isAuthenticatedUser,
      mySavings: rules.isAuthenticatedUser,
      // copyTrades: rules.isAdmin,
      myCopyTrades: rules.isAuthenticatedUser,
      // shillers: rules.isAuthenticatedUser,
      feeds: rules.isAuthenticatedUser,
      feed: rules.isAuthenticatedUser,
      getFiatTransaction: rules.isAuthenticatedUser,
      myNotifications: rules.isAuthenticatedUser,
      notification: rules.isAuthenticatedUser,
      notifications: rules.isAuthenticatedUser,

      //KlineData
      klineData: rules.isAuthenticatedUser,
      tradeKlineData: rules.isAuthenticatedUser,
    },
    Mutation: {
      //remove temporarily to handle admin access
      // createAd: rules.isAuthenticatedUser,
      // updateAd: rules.isAuthenticatedUser,
      // deleteAd: rules.isAuthenticatedUser,

      createCoin: rules.isAdmin,
      updateCoin: rules.isAdmin,
      deleteCoin: rules.isAdmin,

      createCountry: rules.isAdmin,
      updateCountry: rules.isAdmin,
      deleteCountry: rules.isAdmin,

      createFiat: rules.isAdmin,
      updateFiat: rules.isAdmin,
      deleteFiat: rules.isAdmin,

      createNetwork: rules.isAdmin,
      updateNetwork: rules.isAdmin,
      deleteNetwork: rules.isAdmin,

      createPaymentMethod: rules.isAdmin,
      updatePaymentMethod: rules.isAdmin,
      deletePaymentMethod: rules.isAdmin,

      createPost: or(rules.isAuthenticatedUser, rules.isEditor),
      updatePost: or(rules.isAuthenticatedUser, rules.isEditor),
      deletePost: or(rules.isAuthenticatedUser, rules.isEditor),

      createRate: rules.isAdmin,
      updateRate: rules.isAdmin,
      deleteRate: rules.isAdmin,

      createRateCategory: rules.isAdmin,
      updateRateCategory: rules.isAdmin,
      deleteRateCategory: rules.isAdmin,

      createRateProvider: rules.isAdmin,
      updateRateProvider: rules.isAdmin,
      deleteRateProvider: rules.isAdmin,

      createTrader: rules.isAdmin,
      updateTrader: rules.isAdmin,
      deleteTrader: rules.isAdmin,

      createTransaction: rules.isAuthenticatedUser,
      updateTransaction: rules.isAuthenticatedUser,
      deleteTransaction: rules.isAuthenticatedUser,

      loadFiatWalletWithMpesa: rules.isAuthenticatedUser,
      loadFiatWalletWithCard: rules.isAuthenticatedUser,

      logOut: rules.isAuthenticatedUser,
      updateProfile: rules.isAuthenticatedUser,

      subscribeToPlan: rules.isAuthenticatedUser,
      fiatWalletSendMoney: rules.isAuthenticatedUser,
      createSaving: rules.isAuthenticatedUser,

      copyTheTrader: rules.isAuthenticatedUser,
      withdrawCrypto: rules.isAuthenticatedUser,
      swapTokens: rules.isAuthenticatedUser,
      payPush: rules.isAuthenticatedUser,
      payPull: rules.isAuthenticatedUser,
      pushPayClaim: rules.isAuthenticatedUser,
      commentFeed: rules.isAuthenticatedUser,
      reactToFeed: rules.isAuthenticatedUser,
      commentOnComment: rules.isAuthenticatedUser,
      reactOnComment: rules.isAuthenticatedUser,
      // v1 topup and withdrawal [add cashier role]
      userRequestOnFiatWallet: rules.isAuthenticatedUser,
      adminMarkFiatWalletRequestAsCompleted: or(
        rules.isAuthenticatedUser,
        rules.isCashier,
      ),
      updateNotification: rules.isAuthenticatedUser,
      updateMyNotificationsStatus: rules.isAuthenticatedUser,
      mpesaDeposit: rules.isAuthenticatedUser,

      //Buy and sell
      BuySell: rules.isAuthenticatedUser,


    },
  },
  { allowExternalErrors: true },
)
