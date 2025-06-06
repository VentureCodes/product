import { ethers } from "ethers";
import { contracts } from "./config";

export class VaultWrapper {
  // variables
  private contract: ethers.Contract;
  private address: string;
  private abi: any;

  //   constructor
  constructor(signer: ethers.Signer) {
    this.address = contracts.vault.address!;
    this.abi = contracts.vault.abi!;
    this.contract = new ethers.Contract(this.address, this.abi, signer);
  }

  // getters
  async getCopyTraders(): Promise<any> {
    try {
      return await this.contract.copyTraders();
    } catch (error) {
      return [];
    }
  }
  async getOwner(): Promise<string> {
    try {
      return await this.contract.owner();
    } catch (error) {
      return "";
    }
  }
  // getUserBalancesByToken
  getUserBalancesByToken(token: string, user: string) {
    try {
      return this.contract.balances(token, user);
    } catch (error) {
      console.log("Error: ", error);
      return 0;
    }
  }

  async checkAllowedToken(token: string): Promise<boolean> {
    try {
      return await this.contract.allowedTokens(token);
    } catch (error) {
      return false;
    }
  }

  async getManager(): Promise<string> {
    try {
      return await this.contract.manager();
    } catch (error) {
      return "";
    }
  }

  // setters
  async setAllowedToken(token: string): Promise<void> {
    try {
      await this.contract.setAllowedToken(token);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async withdraw(
    token: string,
    to: string,
    amount: number,
    leverage: string
  ): Promise<string> {
    try {
      await this.contract.withdraw(token, to, amount, leverage);
      return "Successfully made a withdrawal";
    } catch (error) {
      console.log("Error: ", error);
      return "Error making a withdrawal";
    }
  }

  async setManager(address: string): Promise<string> {
    try {
      return await this.contract.setManager(address);
    } catch (error) {
      return "";
    }
  }

  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amount: number
  ): Promise<string> {
    try {
      await this.contract.swapTokens(tokenIn, tokenOut, amount);
      return "Successfully swapped tokens";
    } catch (error) {
      console.log("Error: ", error);
      return "Error swapping tokens";
    }
  }

  async makeCopyTrade(
    token: string,
    amount: number,
    userName: string,
    leverage: string,
    userId: string,
    lockPeriod: number,
    userWallet: string
  ): Promise<string> {
    try {
      await this.contract.makeCopyTrade(
        token,
        amount,
        userName,
        leverage,
        userId,
        lockPeriod,
        userWallet
      );
      return "Successfully made a copy trade";
    } catch (error) {
      console.log("Error: ", error);
      return "Error making a copy trade";
    }
  }
}
