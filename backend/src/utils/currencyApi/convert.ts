import axios from 'axios'

type CurrencyRateParams = {
  base_currency: string
  value: string
  currency: string[]
}

type Headers = {
  apikey: string
}

class CurrencyAPI {
  private headers: Headers

  constructor(apikey: string) {
    this.headers = {
      apikey,
    }
  }

  convert = async (params: CurrencyRateParams) => {
    // const url = `https://api.currencyapi.com/v3/convert?currencies=${params.currency}&base_currency=${params.base_currency}&value=${params.value}`
    const url = `https://api.currencyapi.com/v3/latest?currencies=${params.currency}&base_currency=${params.base_currency}&value=${params.value}`

    const { data } = await axios({
      method: 'get',
      url,
      headers: this.headers,
    })

    return data
  }
}

export const converter = new CurrencyAPI(process.env.CURRENCY_API_KEY as string)
