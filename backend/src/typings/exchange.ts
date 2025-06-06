import { OrderResultV5 } from "bybit-api";

export interface ClosedOrder {
    orderId: string;
    size: string;
    pnl: string;
    entryPrice: string;
    exitPrice: string;
    side: string;
    symbol: string;
  }

  
  export interface AmendOrderResponse {
    retCode: number;
    retMsg: string;
    result: OrderResultV5;
    retExtInfo?: any;
    time?: number;
  }

  export interface Order {
    id: string;
    orderLinkId: string;
    market: string;
    side: string;
    type: string;
    price: string;
    quantity: number;
    triggerPrice?: string;
    stopLoss?: string;
    takeProfit?: string;
  }
  