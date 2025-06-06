import { PrismaClient } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { CopyStatus } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/accounts', async (_req: Request, res: Response) => {
  try {
    let accs = await prisma.cryptoAccount.findMany()

    res.json({ success: true, count: accs.length, data: accs })
  } catch (err) {
    console.error(err)
    res.json({ success: false, error: 'Error fetching shill stats' })
  }
})

router.get('/wallets', async (_req: Request, res: Response) => {
  try {
    let wallets = await prisma.cryptoWallet.findMany()

    res.json({ success: true, count: wallets.length, data: wallets })
  } catch (err) {
    res.json({ success: false, error: `Error fetching wallets: ${err}` })
  }
})

router.get('/fiatWallet', async (_req: Request, res: Response) => {
  try {
    let wallets = await prisma.fiatWallet.findMany()

    res.json({ success: true, count: wallets.length, data: wallets })
  } catch (err) {
    res.json({ success: false, error: `Error fetching fiat wallets: ${err}` })
  }
})

router.get('/users', async (_req: Request, res: Response) => {
  try {
    let users = await prisma.user.findMany()

    res.json({ success: true, count: users.length, data: users })
  } catch (err) {
    res.json({ success: false, error: `Error fetching users: ${err}` })
  }
})

// Update wallet balance
router.post('/updateWallet', async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    // Query Fiat Wallet
    const fiatWalets = await prisma.fiatWallet.findMany()
    // Loop through FiatWallets
    let updatedWalletList = []
    for (let i = 0; i < fiatWalets.length; i++) {
      let id = fiatWalets[i].id
      let balance = 0.0
      let lockedBal = 0.0 // Update Fiat Wallet

      let updatedWallet = await prisma.fiatWallet.update({
        where: { id: id },
        data: {
          balance: parseFloat(balance.toString()),
          lockedBal: parseFloat(lockedBal.toString()),
        },
      })

      updatedWalletList.push(updatedWallet)
    }
    res.json({
      success: true,
      count: updatedWalletList.length,
      data: updatedWalletList,
    })
  } catch (err) {
    res.json({ success: false, error: `Error updating wallet: ${err}` })
  }
})

// Get Trade Signals
router.get('/tradeSignals', async (_req: Request, res: Response) => {
  try {
    let tradeSignals = await prisma.trade.findMany()

    res.json({ success: true, count: tradeSignals.length, data: tradeSignals })
  } catch (err) {
    res.json({ success: false, error: `Error fetching trade signals: ${err}` })
  }
})

// Update Trade Signal
router.post('/deleteTradeSignal', async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    // Query Trade Signal
    const tradeSignals = await prisma.trade.findMany()
    // Loop through Trade Signals
    let updatedTradeSignalList = []
    for (let i = 0; i < tradeSignals.length; i++) {
      let id = tradeSignals[i].id
      console.log(id)

      let updatedTradeSignal = await prisma.trade.deleteMany({
        where: { id: id },
      })

      updatedTradeSignalList.push(updatedTradeSignal)
    }
    res.json({
      success: true,
      count: updatedTradeSignalList.length,
      data: updatedTradeSignalList,
    })
  } catch (err) {
    res.json({ success: false, error: `Error updating trade signal: ${err}` })
  }
})

//delete User with phonenumber
router.post('/deleteUser', async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    // Step 1: Delete dependent records
    await prisma.otp.deleteMany({ where: { userId: id } });
    await prisma.cryptoTransaction.deleteMany({ where: { userId: id } });
    await prisma.cryptoWallet.deleteMany({ where: { userId: id } });
    await prisma.referralUsage.deleteMany({ where: { userId: id } });
    await prisma.referral.deleteMany({ where: { referrerId: id } });

    // Step 2: Delete user after dependencies are removed
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      error: `Error deleting user: ${error}`,
    });
  }
});



// Get Copy Traders
router.get('/copyTrades', async (_req: Request, res: Response) => {
  try {
    let copyTrades = await prisma.copyTrade.findMany()

    res.json({ success: true, count: copyTrades.length, data: copyTrades })
  } catch (err) {
    res.json({ success: false, error: `Error fetching copy traders: ${err}` })
  }
})

// Update Copy Trade
router.post('/updateCopyTrades', async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    // Query Copy Trade
    const copyTrades = await prisma.copyTrade.findMany()

    // Loop through Copy Trades
    let updatedCopyTradeList = []
    for (let i = 0; i < copyTrades.length; i++) {
      let id = copyTrades[i].id

      let updatedCopyTrade = await prisma.copyTrade.update({
        where: { id: id },
        data: {
          status: CopyStatus.Completed,
        },
      })

      updatedCopyTradeList.push(updatedCopyTrade)
    }
    res.json({
      success: true,
      count: updatedCopyTradeList.length,
      data: updatedCopyTradeList,
    })
  } catch (err) {
    res.json({ success: false, error: `Error updating copy trade: ${err}` })
  }
})

// Get Trade Info
router.get('/tradeInfo', async (_req: Request, res: Response) => {
  try {
    let tradeInfo = await prisma.tradeInformation.findMany()

    res.json({ success: true, count: tradeInfo.length, data: tradeInfo })
  } catch (err) {
    res.json({ success: false, error: `Error fetching trade info: ${err}` })
  }
})

// UPDATE Trade Info Status
router.post('/updateTradeInfo', async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    // Query Trade Info
    const tradeInfo = await prisma.tradeInformation.findMany()

    // Loop through Trade Info
    let updatedTradeInfoList = []
    for (let i = 0; i < tradeInfo.length; i++) {
      let id = tradeInfo[i].id

      let updatedTradeInfo = await prisma.tradeInformation.update({
        where: { id: id },
        data: {
          status: CopyStatus.Completed,
        },
      })

      updatedTradeInfoList.push(updatedTradeInfo)
    }
    res.json({
      success: true,
      msg: req.body,
      count: updatedTradeInfoList.length,
      data: updatedTradeInfoList,
    })
  } catch (err) {
    res.json({ success: false, error: `Error updating trade info: ${err}` })
  }
})
export { router as devRouter }
