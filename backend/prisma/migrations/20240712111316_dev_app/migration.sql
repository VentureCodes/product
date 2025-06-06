/*
  Warnings:

  - You are about to drop the column `payment` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol]` on the table `Coin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Fiat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Network` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[symbol]` on the table `Network` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiatId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - The required column `invoiceNumber` was added to the `Transaction` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `paymentMethodId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('Rate');

-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('Pending', 'Completed');

-- CreateEnum
CREATE TYPE "SavingDuration" AS ENUM ('Monthly', 'Weekly', 'Quarterly', 'Yearly');

-- CreateEnum
CREATE TYPE "SubscriptionPackage" AS ENUM ('Monthly', 'Quarterly', 'Yearly');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('VerifyEmail', 'VerifyPhone', 'ChangePassword', 'ApproveTransaction', 'LoginVerify');

-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('Open', 'Suspended', 'Closed');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('Current', 'Savings', 'Joint');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Deposit', 'Withdrawal', 'Transfer', 'Exchange', 'Payment', 'Refund', 'P2P');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Draft', 'Published', 'Archived');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('Software', 'Design', 'Digital');

-- CreateEnum
CREATE TYPE "PostTopic" AS ENUM ('Bootcamp', 'Mentorship');

-- CreateEnum
CREATE TYPE "TradingStyle" AS ENUM ('SwingTrading', 'DayTrading', 'Scalping', 'PositionTrading');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('Bybit', 'Binance', 'Bitmex', 'Kraken');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'Failed';

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_senderId_fkey";

-- AlterTable
ALTER TABLE "Ad" DROP COLUMN "payment";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isActive",
DROP COLUMN "senderId",
ADD COLUMN     "adId" TEXT NOT NULL,
ADD COLUMN     "amountReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fiatId" TEXT NOT NULL,
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paymentMethodId" TEXT NOT NULL,
ADD COLUMN     "paymentSecureId" TEXT,
ADD COLUMN     "paymentUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'P2P';

-- DropEnum
DROP TYPE "Payment";

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiatWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fiatId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "WalletStatus" NOT NULL DEFAULT 'Open',
    "type" "WalletType" NOT NULL DEFAULT 'Current',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "countryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "networkId" INTEGER NOT NULL,
    "mnemonic" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoAccount" (
    "id" TEXT NOT NULL,
    "cryptoWalletId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "status" "WalletStatus" NOT NULL DEFAULT 'Open',
    "type" "WalletType" NOT NULL DEFAULT 'Current',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiatTransaction" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fiatId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'Pending',
    "type" "TransactionType" NOT NULL DEFAULT 'Deposit',
    "narations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "paymentSecureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,

    CONSTRAINT "FiatTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLine" (
    "id" TEXT NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "photo" TEXT,
    "fiatTransactionId" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "PaymentLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rateCategoryId" TEXT,

    CONSTRAINT "RateProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" TEXT NOT NULL,
    "fiatId" TEXT NOT NULL,
    "rateProviderId" TEXT NOT NULL,
    "buy" DOUBLE PRECISION NOT NULL,
    "sell" DOUBLE PRECISION NOT NULL,
    "monthlyChange" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoRate" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "percentageChange" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "mamlakaSession" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImpressions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "disLikes" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostImpressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "PostCategory" NOT NULL,
    "topic" "PostTopic" NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'Draft',
    "postSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trader" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "yearOfExperience" DOUBLE PRECISION NOT NULL,
    "tradingStyle" "TradingStyle" NOT NULL,
    "averageReturn" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "followers" INTEGER NOT NULL,
    "tradesCopied" INTEGER NOT NULL,
    "successRate" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "bio" TEXT,

    CONSTRAINT "Trader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyTrade" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "leverage" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "status" "CopyStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tradeGroupId" TEXT,

    CONSTRAINT "CopyTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeGroup" (
    "id" TEXT NOT NULL,
    "unrealizedProfit" DOUBLE PRECISION NOT NULL,
    "realizedProfit" DOUBLE PRECISION NOT NULL,
    "totalInvestment" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "traderId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "averageReturn" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "twitter" TEXT NOT NULL,
    "linkedin" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "year" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,

    CONSTRAINT "PerformanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyPerformance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "month" "Month" NOT NULL,
    "percentage" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,

    CONSTRAINT "MonthlyPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL DEFAULT 'Rate',
    "package" "SubscriptionPackage" NOT NULL DEFAULT 'Monthly',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fiatTransactionId" TEXT,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saving" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountEarned" DOUBLE PRECISION,
    "duration" "SavingDuration" NOT NULL DEFAULT 'Yearly',
    "fiatWalletId" TEXT NOT NULL,
    "cryptoAccountId" TEXT,
    "fiatId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCryptoAccount" BOOLEAN NOT NULL DEFAULT false,
    "isMatured" BOOLEAN NOT NULL DEFAULT false,
    "maturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRateCache" (
    "id" TEXT NOT NULL,
    "currencyPair" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyRateCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeCount" TEXT NOT NULL,
    "pnlLoss" TEXT NOT NULL,
    "pnlWin" TEXT NOT NULL,
    "maxLoss" TEXT NOT NULL,
    "avgProfit" TEXT NOT NULL,
    "maxProfit" TEXT NOT NULL,
    "gross" TEXT NOT NULL,
    "winCount" TEXT NOT NULL,
    "lossCount" TEXT NOT NULL,
    "winRate" TEXT NOT NULL,
    "winPercentage" TEXT NOT NULL,
    "avgVolume" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdToPaymentMethod" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FiatWallet_id_key" ON "FiatWallet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FiatWallet_userId_fiatId_key" ON "FiatWallet"("userId", "fiatId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoWallet_userId_key" ON "CryptoWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoAccount_cryptoWalletId_key" ON "CryptoAccount"("cryptoWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "FiatTransaction_invoiceNumber_key" ON "FiatTransaction"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RateCategory_name_key" ON "RateCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RateProvider_name_key" ON "RateProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoRate_market_key" ON "CryptoRate"("market");

-- CreateIndex
CREATE UNIQUE INDEX "PostSource_name_key" ON "PostSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PostImpressions_postId_key" ON "PostImpressions"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Trader_name_key" ON "Trader"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Saving_fiatWalletId_key" ON "Saving"("fiatWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "Saving_cryptoAccountId_key" ON "Saving"("cryptoAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRateCache_currencyPair_key" ON "CurrencyRateCache"("currencyPair");

-- CreateIndex
CREATE UNIQUE INDEX "Shill_name_key" ON "Shill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AdToPaymentMethod_AB_unique" ON "_AdToPaymentMethod"("A", "B");

-- CreateIndex
CREATE INDEX "_AdToPaymentMethod_B_index" ON "_AdToPaymentMethod"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_symbol_key" ON "Coin"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Fiat_name_key" ON "Fiat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_key" ON "Network"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Network_symbol_key" ON "Network"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_invoiceNumber_key" ON "Transaction"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiatWallet" ADD CONSTRAINT "FiatWallet_fiatId_fkey" FOREIGN KEY ("fiatId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiatWallet" ADD CONSTRAINT "FiatWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoAccount" ADD CONSTRAINT "CryptoAccount_cryptoWalletId_fkey" FOREIGN KEY ("cryptoWalletId") REFERENCES "CryptoWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fiatId_fkey" FOREIGN KEY ("fiatId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiatTransaction" ADD CONSTRAINT "FiatTransaction_fiatId_fkey" FOREIGN KEY ("fiatId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiatTransaction" ADD CONSTRAINT "FiatTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLine" ADD CONSTRAINT "PaymentLine_fiatTransactionId_fkey" FOREIGN KEY ("fiatTransactionId") REFERENCES "FiatTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLine" ADD CONSTRAINT "PaymentLine_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateProvider" ADD CONSTRAINT "RateProvider_rateCategoryId_fkey" FOREIGN KEY ("rateCategoryId") REFERENCES "RateCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_fiatId_fkey" FOREIGN KEY ("fiatId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rate" ADD CONSTRAINT "Rate_rateProviderId_fkey" FOREIGN KEY ("rateProviderId") REFERENCES "RateProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImpressions" ADD CONSTRAINT "PostImpressions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postSourceId_fkey" FOREIGN KEY ("postSourceId") REFERENCES "PostSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_tradeGroupId_fkey" FOREIGN KEY ("tradeGroupId") REFERENCES "TradeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceHistory" ADD CONSTRAINT "PerformanceHistory_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPerformance" ADD CONSTRAINT "MonthlyPerformance_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "PerformanceHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_fiatTransactionId_fkey" FOREIGN KEY ("fiatTransactionId") REFERENCES "FiatTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_cryptoAccountId_fkey" FOREIGN KEY ("cryptoAccountId") REFERENCES "CryptoAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_fiatId_fkey" FOREIGN KEY ("fiatId") REFERENCES "Fiat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_fiatWalletId_fkey" FOREIGN KEY ("fiatWalletId") REFERENCES "FiatWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saving" ADD CONSTRAINT "Saving_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdToPaymentMethod" ADD CONSTRAINT "_AdToPaymentMethod_A_fkey" FOREIGN KEY ("A") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdToPaymentMethod" ADD CONSTRAINT "_AdToPaymentMethod_B_fkey" FOREIGN KEY ("B") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
