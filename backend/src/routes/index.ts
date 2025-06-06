import { app } from './../app'
import { Ip2MamlakaCallBackRouter } from './ip2p'
import { loadFiatWalletRouter } from './payments/callbacks'
import { bscRouter } from './bsc'
import { ShillRouter } from './shill'
import { devRouter } from './dev-routes'
import { RatesRouter } from './rates'
import { ExternalRateAPIRouter } from './rates-api-external'
import { testMpesaAuthRouter } from './../graphql/resolvers/mpesa/helpers'
import { c2bCallbackRouter } from '../graphql/resolvers/mpesa/c2bCallback'

app.use([Ip2MamlakaCallBackRouter])
app.use([loadFiatWalletRouter])
app.use([bscRouter])
app.use([RatesRouter])
app.use([Ip2MamlakaCallBackRouter])
app.use([loadFiatWalletRouter])
app.use([ShillRouter])
app.use([testMpesaAuthRouter, c2bCallbackRouter])
app.use([ExternalRateAPIRouter])
app.use([devRouter])
