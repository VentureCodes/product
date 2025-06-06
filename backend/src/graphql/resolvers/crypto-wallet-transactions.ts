import { arg, extendType, intArg, nonNull } from 'nexus'
import { removeEmpty, handlePrismaError } from '../helper'
import {
  allowedTokens,
  swaps,
  walletWithProvider,
} from '../../utils/erc-wallet'
import { GraphQLError } from 'graphql'
import {
  TransactionStatus,
  TransactionType,
  TransferMethod,
} from '@prisma/client'
import { getTokenPrice } from '../../utils/coinMarketCap'

export const CryptoTransactionQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('cryptoTransactions', {
      type: 'CryptoTransaction',
      args: {
        where: arg({
          type: 'CryptoTransactionWhereInput',
        }),
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'CryptoTransactionOrderByInput',
        }),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, orderBy, take, skip } = removeEmpty(args)

        try {
          const _result = await prisma.cryptoTransaction.findMany({
            where,
            orderBy: orderBy || { createdAt: 'desc' },
            take,
            skip,
          })
          if (!_result) {
            console.log('No Transaction History found')
            return []
          }
          // Filter Result to output only supported tokens on tokenSymbol
          const supportedTokens = allowedTokens()
          // console.log({ supportedTokens })
          let result: any = []

          if (_result.length > 0 && supportedTokens.length > 0) {
            _result.filter((transaction) => {
              if (
                transaction.tokenSymbol !== null &&
                supportedTokens.some(
                  (token: any) =>
                    token.symbol === transaction.tokenSymbol ||
                    transaction.tokenSymbol == 'BSC-USD',
                )
              ) {
                transaction.tokenSymbol =
                  transaction.tokenSymbol == 'BSC-USD'
                    ? (transaction.tokenSymbol = 'USDT')
                    : transaction.tokenSymbol

                if (
                  transaction.tokenSymbol == 'USDT' ||
                  transaction.tokenSymbol == 'ETH' ||
                  transaction.tokenSymbol == 'BTC' ||
                  transaction.tokenSymbol == 'BNB' ||
                  transaction.tokenSymbol == 'USDC'
                ) {
                  result.push(transaction)
                }
              }
            })
          }

          return result
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
    t.list.field('myCryptoTransactions', {
      type: 'CryptoTransaction',
      args: {
        take: intArg(),
        skip: intArg(),
        orderBy: arg({
          type: 'CryptoTransactionOrderByInput',
        }),
      },
      resolve: async (_root, args, { prisma, user }) => {
        const { take, skip, orderBy } = removeEmpty(args)
        try {
          return await prisma.cryptoTransaction.findMany({
            where: {
              userId: user?.id,
            },
            take,
            skip,
            orderBy,
            include: {
              user: true,
            },
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    }),
      t.field('cryptoTransaction', {
        type: 'CryptoTransaction',
        args: {
          where: nonNull(
            arg({
              type: 'CryptoTransactionWhereUniqueInput',
            }),
          ),
        },
        resolve: async (_, args, { prisma }) => {
          const { where } = removeEmpty(args)

          try {
            return await prisma.cryptoTransaction.findUnique({
              where,
            })
          } catch (error: any) {
            return handlePrismaError(error)
          }
        },
      })
  },
})

export const CryptoTransactionMutation = extendType({
  type: 'Mutation',
  definition: (t) => {
    // Create a new CryptoTransaction
    t.field('createCryptoTransaction', {
      type: 'CryptoTransaction',
      args: {
        data: nonNull(
          arg({
            type: 'CryptoTransactionCreateInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { data } = removeEmpty(args)

        try {
          return await prisma.cryptoTransaction.upsert({
            where: { hash: data.hash },
            create: data,
            update: {},
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    // Get Token Price Mutation
    t.field('getTokenPrice', {
      type: 'CryptoTokenPrice',
      args: {
        data: nonNull(
          arg({
            type: 'GetTokenPriceInput',
          }),
        ),
      },
      resolve: async (_, args) => {
        const { data } = removeEmpty(args)

        try {
          const tokenPrice = await getTokenPrice(data.symbol)
          if (!tokenPrice) {
            throw new GraphQLError('Token price not found', {
              extensions: { message: 'TOKEN_PRICE_NOT_FOUND' },
            })
          }
          return {
            price: tokenPrice.price,
            symbol: tokenPrice.symbol,
          }
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    //Create a new swap crypto transaction
    t.field('createSwapCryptoTransaction', {
      type: 'CryptoTransaction',
      args: {
        data: nonNull(
          arg({
            type: 'SwapCryptoTransactionCreateInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma, user }) => {
        const { data } = removeEmpty(args)

        // Ensure the user is authenticated
        if (!user) {
          throw new GraphQLError('Unauthorized', {
            extensions: { message: 'USER_NOT_AUTHENTICATED' },
          })
        }

        const cyrptoWallet = await prisma.cryptoWallet.findFirst({
          where: {
            userId: user.id,
          },
          select: {
            mnemonic: true,
            accounts: {
              select: {
                address: true,
                privateKey: true,
              },
            },
          },
        })

        if (!cyrptoWallet && !cyrptoWallet!.accounts) {
          throw new GraphQLError(
            "You don't have a wallet. please contact customer care ...",
            {
              extensions: {
                message: 'WALLET_NOT_FOUND',
              },
            },
          )
        }

        // Fetch the user wallet
        const testnet =
          process.env.BLOCKCHAIN_NETWORK === 'testnet' ? true : false
        const { ercWrapper, wallet } = await walletWithProvider(
          testnet,
          cyrptoWallet!.mnemonic,
        )

        if (!wallet || !ercWrapper) {
          throw new GraphQLError('Error getting user wallet information', {
            extensions: {
              message: 'WALLET_NOT_FOUND',
            },
          })
        }

        // Perform the token swap
        const swapResult = await swaps(
          testnet,
          cyrptoWallet!.mnemonic,
          data.tokenIn,
          data.tokenOut,
          data.amountIn,
          cyrptoWallet?.accounts?.address!,
        )

        const receipt = swapResult.data
        console.log('SWAP RECEIPT:', receipt)

        // Check Successful transaction before saving
        if (receipt.status !== 1) {
          throw new GraphQLError('Swap transaction failed.', {
            extensions: { message: `SWAP_TRANSACTION_FAILED: ${receipt}` },
          })
        }

        const formattedGas = receipt.gasUsed.toString()
        const formattedGasPrice = receipt.gasPrice.toString()
        const formattedBlockNumber = receipt.blockNumber.toString()

        try {
          const createdSwapTransaction = await prisma.cryptoTransaction.create({
            data: {
              hash: receipt.hash.toString(),
              from: receipt.from.toString(),
              timeStamp: new Date().toISOString(),
              blockNumber: formattedBlockNumber,
              to: receipt.to.toString(),
              value: parseFloat(data.amountIn),
              gas: formattedGas,
              gasPrice: formattedGasPrice,
              txreceipt_status: receipt.status.toString(),
              tokenSymbol: data.tokenIn,
              toSymbol: data.tokenOut,
              type: TransactionType.Exchange,
              status: TransactionStatus.Completed,
              transferMethod: TransferMethod.CRYPTOSWAP,
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          })
          console.log('CREATED SWAP TRANSACTION:', createdSwapTransaction)

          return createdSwapTransaction
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    // Update a CryptoTransaction status
    t.field('updateCryptoTransactionStatus', {
      type: 'CryptoTransaction',
      args: {
        where: nonNull(
          arg({
            type: 'CryptoTransactionWhereUniqueInput',
          }),
        ),
        data: nonNull(
          arg({
            type: 'CryptoTransactionStatusUpdateInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where, data } = removeEmpty(args)

        try {
          return await prisma.cryptoTransaction.update({
            where,
            data,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })

    // Optional: Delete a CryptoTransaction
    t.field('deleteCryptoTransaction', {
      type: 'CryptoTransaction',
      args: {
        where: nonNull(
          arg({
            type: 'CryptoTransactionWhereUniqueInput',
          }),
        ),
      },
      resolve: async (_, args, { prisma }) => {
        const { where } = removeEmpty(args)
        // Check if the transaction exists
        const transaction = await prisma.cryptoTransaction.findUnique({
          where,
        })

        if (!transaction) {
          throw new Error('Transaction not found')
        }

        try {
          return await prisma.cryptoTransaction.delete({
            where,
          })
        } catch (error: any) {
          return handlePrismaError(error)
        }
      },
    })
  },
})
