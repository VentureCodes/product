import { httpRequest } from "./http-request";
import {
  MamlakaCurrencyEnum,
  MamlakaGenerateCardPaymentLinkResponse,
  MamlakaInitiateMobileMoneyResponse,
} from "./types";
export class MamlakaWrapper {
  private _baseUrl: string;
  private _username: string;
  private _session: string;

  //@ts-ignore
  private _headers: {
    "Content-Type": string;
    Authorization: string;
  };
  constructor(baseUrl: string, username: string, session: string) {
    this._baseUrl = baseUrl;
    this._username = username;
    this._session = session;
    this._headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this._session}`,
    };
  }

  /**
   * MNO deposit with mpesa
   */
  async initiateMobilePayment(opts: {
    currency: MamlakaCurrencyEnum;
    payerPhone: string;
    externalId: string;
    callbackUrl: string;
    amount: number;
  }): Promise<MamlakaInitiateMobileMoneyResponse | undefined> {
    try {
      const { data } = await httpRequest.post(
        `${this._baseUrl}/api/rs/merchant/at/initiate_mobile_payment`,
        {
          impalaMerchantId: this._username,
          currency: opts.currency,
          payerPhone: opts.payerPhone,
          mobileMoneySP: "M-Pesa",
          externalId: opts.externalId,
          callbackUrl: opts.callbackUrl,
          amount: opts.amount,
        },
        {
          headers: this._headers,
        }
      );

      return data;
    } catch (error) {
      console.log("Initialte Mobile Payment Error: ", error);
      return undefined;
    }
  }

  async generateCardPaymentLink(opts: {
    impalaMerchantId: string;
    currency: MamlakaCurrencyEnum;
    amount: string;
    externalId: string;
    callbackUrl: string;
    redirectUrl: string;
  }): Promise<MamlakaGenerateCardPaymentLinkResponse | undefined> {
    try {
      const { data } = await httpRequest.post(
        `${this._baseUrl}/api/?resource=merchant&action=generateCardPaymentLink`,
        {
          impalaMerchantId: this._username,
          currency: opts.currency,
          amount: opts.amount,
          externalId: opts.externalId,
          callbackUrl: opts.callbackUrl,
          redirectUrl: opts.redirectUrl,
        },
        {
          headers: this._headers,
        }
      );

      return data;
    } catch (error) {
      console.log("Generate Card Payment Link Error: ", error);
      return undefined;
    }
  }

  async withdrawToMobileMoney(opts: {
    currency: MamlakaCurrencyEnum;
    amount: string;
    recipientPhone: string;
    externalId: string;
    callbackUrl: string;
  }) {
    try {
      const { data } = await httpRequest.post(
        `${this._baseUrl}/api/rs/merchant/at/send_money_mobile`,

        {
          impalaMerchantId: this._username,
          currency: opts.currency,
          amount: opts.amount,
          recipientPhone: opts.recipientPhone,
          mobileMoneySP: "M-Pesa",
          externalId: opts.externalId,
          callbackUrl: opts.callbackUrl,
        },
        {
          headers: this._headers,
        }
      );

      return data;
    } catch (error) {
      console.log("Withdraw to Mobile Money Error: ", error);
      return undefined;
    }
  }
}
