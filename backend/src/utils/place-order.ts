import { OrderParamsV5, OrderSideV5, OrderTypeV5, CategoryV5 } from 'bybit-api'
import { BybitWrapper } from './exchange'
import { Trade } from '@prisma/client'

/**
 * Interface for the order placement result
 */
interface OrderResult {
  success: boolean
  orderId?: string
  message: string
  details?: {
    symbol: string
    side: string
    orderType: string
    price: string
    quantity: string
    takeProfit?: string
    stopLoss?: string
  }
}

export class TradingService {
  private bybit: BybitWrapper

  constructor(apiKey: string, apiSecret: string) {
    this.bybit = new BybitWrapper(apiKey, apiSecret)
  }

  /**
   * Calculates the token amount based on USD value and instrument specifications
   * @param symbol - Trading pair symbol
   * @param priceUSD - Price in USD
   * @param tradeAmountUSD - Trade amount in USD
   * @returns Object containing quantity and tickSize, or null if calculation fails
   */
  private async calculateTokenAmount(
    symbol: string,
    priceUSD: number,
    tradeAmountUSD: number,
  ): Promise<{ quantity: string; tickSize: number } | null> {
    try {
      // Get instrument info for precision and limits
      const instrumentInfo = await this.bybit.getTickSize({
        category: 'linear',
        symbol: symbol,
      })

      if (!instrumentInfo) {
        console.error('Failed to get instrument info')
        return null
      }

      const { tickSize, minOrderQty, qtyStep } = instrumentInfo

      // Calculate quantity in tokens
      const price = Number(priceUSD)
      let quantity = tradeAmountUSD / price

      // Round to the nearest step size
      quantity = Math.floor(quantity / Number(qtyStep)) * Number(qtyStep)

      // Ensure minimum order size
      if (quantity < Number(minOrderQty)) {
        quantity = Number(minOrderQty)
      }

      return {
        quantity: quantity.toFixed(8),
        tickSize: tickSize,
      }
    } catch (error) {
      console.error('Error calculating token amount:', error)
      return null
    }
  }

  /**
   * Formats the price according to the tick size
   * @param price - Price to format
   * @param tickSize - Minimum price movement
   * @returns Formatted price string
   */
  private formatPrice(price: number, tickSize: number): string {
    const decimalPlaces = -Math.log10(tickSize)
    return Number(price).toFixed(decimalPlaces)
  }

  /**
   * Places an order on Bybit exchange
   * @param trade - Trade object containing order details
   * @returns OrderResult object with success status and order details
   */

  async placeOrder(trade: Trade, tradeAmount: number): Promise<OrderResult> {
    try {
      // Calculate token amount based on USD value
      const amountInfo = await this.calculateTokenAmount(
        trade.token,
        trade.entryPrice,
        tradeAmount,
      )

      if (!amountInfo) {
        return {
          success: false,
          message: 'Failed to calculate token amount',
        }
      }

      const { quantity, tickSize } = amountInfo

      // Determine order side based on trade signal
      const side: OrderSideV5 = trade.tradeSignal.toLowerCase().includes('buy')
        ? 'Buy'
        : 'Sell'

      // Prepare order parameters
      const orderParams: OrderParamsV5 = {
        category: 'linear' as CategoryV5,
        symbol: trade.token,
        side,
        orderType: 'Limit' as OrderTypeV5,
        qty: quantity,
        price: this.formatPrice(trade.entryPrice, tickSize),
        timeInForce: 'GTC',
        reduceOnly: false,
        closeOnTrigger: false,
      }
      console.log({ orderParams })

      // Add take profit if specified
      if (trade.takeProfit) {
        orderParams.takeProfit = this.formatPrice(trade.takeProfit, tickSize)
      }

      // Add stop loss if specified
      if (trade.stopLoss) {
        orderParams.stopLoss = this.formatPrice(trade.stopLoss, tickSize)
      }

      // Place the order
      const response = await this.bybit.placeOrder(orderParams)

      console.log({ response })

      if (response.success && response.order) {
        return {
          success: true,
          message: 'Order placed successfully',
          orderId: response.order.id,
          details: {
            symbol: response.order.market,
            side: response.order.side,
            orderType: response.order.type,
            price: response.order.price,
            quantity: String(response.order.quantity),
            takeProfit: response.order.stopLoss,
            stopLoss: response.order.stopLoss,
          },
        }
      }

      // Handle unsuccessful order placement
      return {
        success: false,
        message: response.message || 'Order placement failed',
      }
    } catch (error) {
      console.error('Error placing order:', error)
      return {
        success: false,
        message: `Error placing order: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }
}
