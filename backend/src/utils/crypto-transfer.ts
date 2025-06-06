import {erc20Wrapper} from './erc-wallet';
import RPCManager from './rpc';


// TODOS - Transfer crypto from one erc wallet to another

// 1. transfer crypto from one wallet to another


export const transferToken = async (token:string, to:string, amount: string,pk:string, is_eth:boolean,isTestnet?:true) => {
    try {

   // TODOs
   // 1. Initialize RPCManager & CONNECT to RPC
   // 2. Initialize ERC20Wrapper
    // 3. Transfer token
    // - Get the token balance ETH or TOKEN
    // - Check if the token balance is greater than the amount to transfer
    // - Get the token allowance
    // - Transfer the token
    // - Return the transaction hash


   //   1. Initialize ERC20Wrapper
    const rpcManager = new RPCManager()
    const rpcUrl = (await rpcManager.get(isTestnet!)) as string
    const connected = await erc20Wrapper.connect(pk, rpcUrl);
    console.log(`Connected to RPC: ${connected}`)

    const transfer = await erc20Wrapper.send(to,token,amount,is_eth);
    console.log(`Transfered token: ${transfer}`)
    return transfer;   
          
    } catch (error:any) {
        console.log(`PUSH Error transfering token: `,error)
        return error;        
    }


}