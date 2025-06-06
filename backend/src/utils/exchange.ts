import {
  CategoryV5,
  RestClientV5,
  AmendOrderParamsV5,
  GetAccountOrdersParamsV5,
  GetInstrumentsInfoParamsV5,
  GetTickersParamsV5,
  OrderParamsV5,
  SetTradingStopParamsV5,
  AccountOrderV5,
  LinearInverseInstrumentInfoV5,
  PositionV5,
  TickerLinearInverseV5,
  CancelAllOrdersParamsV5,
  OrderFilterV5,
  GetClosedPnLParamsV5,
} from 'bybit-api'
import { sendTgMsg } from './sms'
import { AmendOrderResponse, ClosedOrder, Order } from '../typings/exchange'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export class BybitWrapper {
  client: RestClientV5

  constructor(apiKey: string, apiSecret: string) {
    this.client = new RestClientV5({
      secret: apiSecret,
      key: apiKey,
      testnet: false,
      parse_exceptions: true,
    })
  }

  getTickSize = async (
    params: GetInstrumentsInfoParamsV5,
  ): Promise<{
    priceScale: string
    tickSize: number
    minOrderQty: string
    maxOrderQty: string
    qtyStep: string
  } | null> => {
    try {
      const response = await this.client.getInstrumentsInfo(params)
      if (!response || response.retCode !== 0) {
        sendTgMsg(`\`symbol: ${params.symbol} ${response.retMsg}\``)
        return null
      }

      const instrumentInfo = (
        response.result.list as LinearInverseInstrumentInfoV5[]
      ).find((s) => s.symbol === params.symbol)
      if (!instrumentInfo) {
        sendTgMsg(`\`symbol: ${params.symbol} ${response.retMsg}\``)
        return null
      }

      return {
        priceScale: instrumentInfo.priceScale,
        tickSize: Number(instrumentInfo.priceFilter.tickSize),
        minOrderQty: instrumentInfo.lotSizeFilter.minOrderQty,
        maxOrderQty: instrumentInfo.lotSizeFilter.maxOrderQty,
        qtyStep: instrumentInfo.lotSizeFilter.qtyStep,
      }
    } catch (error) {
      console.error('Error in getTickSize:', error)
      return null
    }
  }

  getPrice = async (
    params: GetTickersParamsV5<'linear' | 'inverse'>,
  ): Promise<number | null> => {
    try {
      const { result } = await this.client.getTickers(params)
      let _result = (result.list as TickerLinearInverseV5[]).find(
        (item: { symbol: string }) => item.symbol === params.symbol,
      )
      if (!_result) {
        sendTgMsg(`Ticker info not found for symbol: ${params.symbol}`)
        return null
      }
      return Number(_result.lastPrice)
    } catch (error) {
      console.error('Error in getPrice:', error)
      return null
    }
  }

  getActiveOrders = async (
    _params: GetAccountOrdersParamsV5,
  ): Promise<{ activeOrder: AccountOrderV5[] | any }> => {
    const { retCode, result } = await this.client.getActiveOrders(_params)
    return {
      activeOrder:
        retCode === 0 && result?.list
          ? result.list.map((order: AccountOrderV5) => ({
              id: order.orderId,
              market: order.symbol,
              side: order.side,
              type: order.orderType || 'Not Provided',
              price: Number(order.price),
              quantity: Number(order.qty),
              status: order.orderStatus,
              filled: Number(order.cumExecQty),
              remaining: Number(order.leavesQty),
              createType: order.createType,
              createdAt: order.createdTime,
              clientId: order.orderLinkId || '',
            }))
          : [],
    }
  }
  /**
   * Edit Active Order
   * @param _params
   * @returns null
   * @see https://bybit-exchange.github.io/docs/v5/linear/#t-amendactive
   */

  amendOrder = async (
    _params: AmendOrderParamsV5,
  ): Promise<AmendOrderResponse | null> => {
    try {
      const { result, retCode, retMsg } = await this.client.amendOrder(_params)
      if (retCode === 0) {
        sendTgMsg(retMsg)
        return { retCode, result, retMsg }
      } else {
        this.handleTradingStopError(retCode, retMsg)
        return null
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  /**
   *
   * @param _params {}
   * @returns order placed
   */

  async placeOrder(
    _params: OrderParamsV5,
  ): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
      const { retCode, result, retMsg } = await this.client.submitOrder(_params)
      console.log({ submitOrder: result, retCode, retMsg })
      if (retCode === 0 && result) {
        return {
          success: true,
          order: {
            id: result.orderId,
            orderLinkId: result.orderLinkId,
            market: _params.symbol,
            side: _params.side,
            type: _params.orderType,
            price: _params.price || '',
            triggerPrice: _params.triggerPrice || '',
            quantity: Number(_params.qty),
            stopLoss: _params.stopLoss || '',
            takeProfit: _params.takeProfit || '',
          },
        }
      } else {
        return { success: false, message: retMsg }
      }
    } catch (error: any) {
      console.log('Error in placeOrder:', error)
      return {
        success: false,
        message: 'Exception in placing order: ' + error.message,
      }
    }
  }
  /**
   * Batch submit orders
   * @param category
   * @param orders
   * @returns Promise<any[]>
   * @see https://bybit-exchange.github.io/docs/v5/linear/#t-batchorder
   */
  async batchSubmitOrders(orders: OrderParamsV5[]): Promise<any[]> {
    let orderResults = []
    for (let order of orders) {
      const response = await this.placeOrder(order)
      if (response.success && response.order) {
        orderResults.push({ success: true, order: response.order })
      } else {
        orderResults.push({
          success: false,
          order: {
            symbol: order.symbol || 'N/A',
            side: order.side || 'N/A',
            qty: order.qty || 'N/A',
            price: order.price || 'N/A',
            triggerPrice: order.triggerPrice || 'N/A',
            stopLoss: order.stopLoss || 'N/A',
          },
          message: response.message || 'Unknown error',
        })
      }
      await sleep(500)
    }
    return orderResults
  }

  /**
   * Set trading stop for a position (Take Profit/Stop Loss).
   * @param params The parameters for setting the trading stop.
   * @see https://bybit-exchange.github.io/docs/v5/position/trading-stop#:~:text=Set%20the%20take%20profit%2C%20stop,trailing%20stop%20for%20the%20position.&text=Passing%20these%20parameters%20will%20create,size%20of%20the%20open%20position.
   */
  setTradingStop = async (params: SetTradingStopParamsV5): Promise<any> => {
    try {
      const response = await this.client.setTradingStop(params)
      const { retCode, retMsg } = response
      if (retCode === 10001) {
        sendTgMsg(`\`${retMsg}\``)
        return null
      }
      if (retCode === 0) {
        return { message: 'Trading stop set successfully.' }
      } else {
        this.handleTradingStopError(retCode, retMsg)
        return null
      }
    } catch (error: any) {
      console.error(error)
      sendTgMsg(`Unexpected error occurred: ${error.message}`)
      return null
    }
  }

  /**
   * Handle trading stop errors by sending appropriate messages.
   * @param retCode The return code from the API response.
   * @param retMsg The return message from the API response.
   */
  private handleTradingStopError = (retCode: number, retMsg: string): void => {
    // Handle different error codes with custom messages
    switch (retCode) {
      case 10001:
        sendTgMsg(`Parameter error: ${retMsg}`)
        break
      case 10002:
        sendTgMsg('Verification failed, please check your API keys.')
        break
      // Add cases for other error codes as needed...
      default:
        sendTgMsg(`Error setting trading stop: ${retMsg}`)
        break
    }
  }

  /**
   * Cancel an order.
   * @param _params.orderId Order id.
   * @returns Promise<boolean>
   */

  async cancelOrder(_params: {
    orderId?: string
    symbol: string
    category: CategoryV5
    orderFilter?: OrderFilterV5
  }): Promise<{ success: boolean; message: string }> {
    const { retCode, retMsg } = await this.client.cancelOrder({
      category: _params.category,
      symbol: _params.symbol,
      orderId: _params.orderId,
      orderFilter: _params.orderFilter,
    })
    if (retCode === 0) {
      return { success: true, message: retMsg }
    } else {
      return { success: false, message: retMsg }
    }
  }

  /**
   * Cancel All orders.
   * @returns Promise<boolean>
   */
  cancelAllOrders = async (_params: CancelAllOrdersParamsV5) => {
    let { retCode, retMsg } = await this.client.cancelAllOrders({
      category: _params.category,
      symbol: _params.symbol,
    })
    if (retCode === 0) {
      return { success: true, message: retMsg }
    } else {
      return { success: false, message: retMsg }
    }
  }

  getPositions = async (params: {
    category: CategoryV5
    symbol?: string
    settleCoin?: string
  }): Promise<{
    positions: {
      symbol: string
      size: string
      side: string
      openSize: string
      unrealisedPnl: string
      avgPrice: string
      stopLoss: string
      takeProfit?: string
    }[]
    success: boolean
    ret_msg?: string
  }> => {
    let { result, retCode, retMsg } = await this.client.getPositionInfo(params)
    if (retCode === 0) {
      return {
        positions: result.list.map((position: PositionV5) => {
          return {
            symbol: position.symbol,
            size: position.size,
            side: position.side,
            openSize: String(position.size),
            unrealisedPnl: String(position.unrealisedPnl),
            avgPrice: String(position.avgPrice),
            stopLoss: position.stopLoss ? String(position.stopLoss) : '',
            takeProfit: position.takeProfit ? String(position.takeProfit) : '',
          }
        }),
        success: true,
      }
    }
    if (retMsg?.includes('please check your timestamp')) {
      console.log('Timestamp error, retrying...')
      await sleep(1700)
    }
    return {
      positions: [],
      success: false,
      ret_msg: retMsg,
    }
  }

  getClosedPnl = async (
    symbol?: string,
    startTime?: number,
    endTime?: number,
    topN?: number,
  ): Promise<ClosedOrder[] | undefined> => {
    await sleep(3000)

    const params: GetClosedPnLParamsV5 = {
      category: 'linear',
      ...(symbol && { symbol }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    }

    const { result, retCode } = await this.client.getClosedPnL(params)

    if (retCode === 0) {
      let positions = result.list.map((pos) => ({
        orderId: pos.orderId,
        symbol: pos.symbol,
        size: pos.qty,
        pnl: parseFloat(pos.closedPnl).toString(),
        entryPrice: parseFloat(pos.avgEntryPrice).toString(),
        exitPrice: parseFloat(pos.avgExitPrice).toString(),
        side: pos.side,
        updatedTime: parseInt(pos.updatedTime, 10),
      }))
      if (topN) {
        positions = positions.slice(0, topN)
      }

      return positions
    } else {
      console.error(`Failed to retrieve closed PnL: ${retCode}`)
      return undefined
    }
  }
}
