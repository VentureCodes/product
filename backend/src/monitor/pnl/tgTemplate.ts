export const openOrderMsg = async (data: {
    account: number;
    symbol: string;
    side: 'short' | 'long';
    status: string;
    break_even_price: number;
    qty: number;
    current_price: number | string;
    pnl: number;
    points?: number;
    take_profit?: number;
    stop_loss?: number;
  }) => {
    let {
      symbol,
      side,
      account,
      status,
      break_even_price,
      qty,
      current_price,
      pnl,
      points,
    } = data;
    let msg = `TRAP ${account} ${symbol} ${side} ${status}`;
    msg += `\nBE >> ${break_even_price}`;
    msg += `\nQTY >> ${parseFloat(
      (qty * Number(break_even_price)).toExponential(2)
    )}`;
    msg += `\nCP >> ${current_price}`;
    if (data.take_profit) msg += `\nTP >> ${data.take_profit}`;
    if (data.stop_loss) msg += `\nSL >> ${data.stop_loss}`;
    msg += `\nPOINTS >> ${points}`;
    msg += `\nPNL >> ${pnl}`;
    return msg;
  };
  
  
  export const tgTemplate = (data: {
    account: number;
    symbol: string;
    side: 'short' | 'long';
    status: string;
    break_even_price: number;
    qty: number;
    current_price: number | string;
    pnl: number;
    points?: number;
    take_profit?: number;
    stop_loss?: number;
    change?: number;
  }) => {
    let {
      symbol,
      side,
      account,
      status,
      break_even_price,
      qty,
      current_price,
      pnl,
      points,
      take_profit,
      stop_loss,
      change,
    } = data;
    const accountname: string = account === 1 ? 'TRAP1' : 'TRAP2';
    let msg = `\*${accountname}\* \`${symbol}\` \`${side}\` \*${status}\*`;
    msg += `\n*BE* >> \`${break_even_price}\``;
    msg += `\n*QTY* >> \`${parseFloat(
      (qty * Number(break_even_price)).toExponential(2)
    )}\``;
    msg += `\n*CP* >> \`${current_price}\``;
    if (take_profit) msg += `\n*TP* >> \`${take_profit}\``;
    if (stop_loss) msg += `\n*SL* >> \`${stop_loss}\``;
    msg += `\n*PNL* >> \`${pnl}\``;
    if (points) msg += `\n*POINTS* >> \`${points}\``;
    if (change) msg += `\n*%CHG* >> \`${change}\`%`;
  
    return msg;
  };