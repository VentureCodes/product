import {
    CategoryV5,
    LinearInverseInstrumentInfoV5,
    PositionV5,
    RestClientV5,
    TickerLinearInverseV5,
  } from 'bybit-api';
  
  export const getTickSize = async (
    client: RestClientV5,
    symbol: string,
    category: CategoryV5
  ): Promise<{ priceScale: number; tickSize: number } | null> => {
    const { retCode, result } = await client.getInstrumentsInfo({
      category,
      symbol,
    });
    if (retCode === 0) {
      if (result) {
        const instrumentInfo = (
          result.list as LinearInverseInstrumentInfoV5[]
        ).find((s) => s.symbol === symbol);
        return {
          priceScale: Number(instrumentInfo?.priceScale),
          tickSize: Number(instrumentInfo?.priceFilter.tickSize),
        };
      }
      return null;
    }
    return null;
  };
  
  export const getPositions = async (
    category: CategoryV5,
    client: RestClientV5,
    symbol?: string
  ): Promise<{
    positions: {
      market: string;
      size: number;
      side: string;
      openSize: number;
      unrealizedPnl?: number;
      takeProfit?: number;
      stopLoss?: number;
      entry_price: number;
    }[];
    success: boolean;
    retMsg?: string;
  }> => {
    let { result, retMsg } = await client.getPositionInfo({
      category,
      symbol: symbol,
    });
    if (retMsg === 'OK') {
      return {
        positions: result.list
          .filter((position: PositionV5) => Number(position.size) > 0)
          .map((position: PositionV5) => {
            return {
              market: position.symbol,
              size: Number(position.size),
              side: position.side,
              openSize: Number(position.size),
              unrealizedPnl: Number(position.unrealisedPnl),
              takeProfit: position.takeProfit
                ? parseFloat(position.takeProfit)
                : undefined,
              stopLoss: position.stopLoss
                ? parseFloat(position.stopLoss)
                : undefined,
              entry_price: parseFloat(position.avgPrice),
            };
          }),
        success: true,
        retMsg,
      };
    }
  
    if (retMsg?.includes('please check your timestamp')) {
      console.log('Timestamp error, retrying...');
      await sleep(1700);
    }
  
    return {
      positions: [],
      success: false,
      retMsg,
    };
  };
  export const getPrice = async (
    client: RestClientV5,
    symbol: string
  ): Promise<number | null> => {
    try {
      const { retCode, result } = await client.getTickers({
        category: 'linear',
        symbol,
      });
      if (retCode !== 0 && result.list) {
        console.error('Error fetching price: Invalid response');
        return null;
      }
      const ticker = (result.list as TickerLinearInverseV5[]).find(
        (item: { symbol: string }) => item.symbol === symbol
      );
      if (!ticker || typeof ticker.lastPrice !== 'string') {
        console.error('Error fetching price: Ticker not found or invalid format');
        return null;
      }
      return Number(ticker.lastPrice);
    } catch (error) {
      console.error('Error fetching price:', error);
      return null;
    }
  };
  export const getAllPositions = async (
    category: CategoryV5,
    client: RestClientV5,
    settleCoins: string[]
  ): Promise<{
    positions: {
      market: string;
      size: number;
      side: string;
      openSize: number;
      unrealizedPnl?: number;
      takeProfit?: number;
      stopLoss?: number;
      entry_price: number;
    }[];
    success: boolean;
    retMsg?: string;
  }> => {
    let allPositions = [];
    let success = true;
    let retMsg = '';
  
    for (let settleCoin of settleCoins) {
      let { result, retMsg: tempRetMsg } = await client.getPositionInfo({
        category,
        settleCoin,
      });
  
      if (tempRetMsg === 'OK' && result?.list) {
        allPositions.push(
          ...result.list
            .filter((position: PositionV5) => Number(position.size) > 0)
            .map((position: PositionV5) => ({
              market: position.symbol,
              size: Number(position.size),
              side: position.side,
              openSize: Number(position.size),
              unrealizedPnl: Number(position.unrealisedPnl),
              takeProfit: position.takeProfit
                ? parseFloat(position.takeProfit)
                : undefined,
              stopLoss: position.stopLoss
                ? parseFloat(position.stopLoss)
                : undefined,
              entry_price: parseFloat(position.avgPrice),
            }))
        );
      } else {
        success = false;
        retMsg = tempRetMsg;
        break;
      }
    }
  
    return {
      positions: allPositions,
      success,
      retMsg,
    };
  };
  
  export const sleep = async (ms: number) =>
    await new Promise((resolve) => setTimeout(resolve, ms));
  