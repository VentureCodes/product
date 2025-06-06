export interface MamlakAuthResponse {
  error: boolean;
  message: string;
  accessToken: string;
  expires: number;
  expiresDate: string;
}

export enum MamlakaCurrencyEnum {
  KES = "KES",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  ZAR = "ZAR",
  TZS = "TZS",
}

export interface MamlakaInitiateMobileMoneyResponse {
  error: boolean;
  message: string;
  sid: string;
}

export interface MamlakaGenerateCardPaymentLinkResponse {
  error: boolean;
  message: string;
  id: string;
  sid: string;
  paymentUrl: string;
}
