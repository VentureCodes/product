import { prisma } from '../graphql/context'


export const credsChecker = async (sessionId?:string, phone?:string, email?:string) => {
    try {
        if(!sessionId || !phone || !email) {
        return {error: "Unauthorized"}
    }

    const user = await prisma.user.findMany({where: { OR:[{id: sessionId}, {phone: phone}, {email: email}]}})

    if(!user) {
        // TODO - Create new User.
        return {error: "User not found"}
    }
    const walletId = await prisma.cryptoWallet.findFirst({
        where: {
            userId: user[0].id
        }
    })
    if(!walletId) {
        // TODO - Create new Wallet
        return {error: "User wallet not found"}
    }
    const account = await prisma.cryptoAccount.findFirst({
        where: {
            cryptoWalletId: walletId!.id
        }
    })
    if(!account) {
        return {error: "Creds unavailable. Provide Keys"}
    }
    return { user: user[0], walletId, account }

    } catch (error) {
        console.log("Error checking creds: ", error)
        return error
    }
}