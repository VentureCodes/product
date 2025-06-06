/*
  Warnings:

  - A unique constraint covering the columns `[userId,fiatId]` on the table `FiatWallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralLink]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `datePosted` to the `Rate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `RateProvider` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('Like', 'Dislike', 'Love', 'Haha', 'Wow', 'Sad', 'Angry');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'Request';

-- DropForeignKey
ALTER TABLE "CopyTrade" DROP CONSTRAINT "CopyTrade_traderId_fkey";

-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "terms" SET DEFAULT 'Make payment before marking as paid. Use third party at your own risk.';

-- AlterTable
ALTER TABLE "CopyTrade" ALTER COLUMN "traderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Rate" ADD COLUMN     "datePosted" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RateProvider" ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shill" ADD COLUMN     "avgLoss" TEXT DEFAULT '0',
ADD COLUMN     "lossRate" TEXT DEFAULT '0',
ADD COLUMN     "photo" TEXT DEFAULT '',
ADD COLUMN     "winLossRatio" TEXT DEFAULT '0',
ALTER COLUMN "tradeCount" DROP NOT NULL,
ALTER COLUMN "tradeCount" SET DEFAULT '0',
ALTER COLUMN "pnlLoss" DROP NOT NULL,
ALTER COLUMN "pnlLoss" SET DEFAULT '0',
ALTER COLUMN "pnlWin" DROP NOT NULL,
ALTER COLUMN "pnlWin" SET DEFAULT '0',
ALTER COLUMN "maxLoss" DROP NOT NULL,
ALTER COLUMN "maxLoss" SET DEFAULT '0',
ALTER COLUMN "avgProfit" DROP NOT NULL,
ALTER COLUMN "avgProfit" SET DEFAULT '0',
ALTER COLUMN "maxProfit" DROP NOT NULL,
ALTER COLUMN "maxProfit" SET DEFAULT '0',
ALTER COLUMN "gross" DROP NOT NULL,
ALTER COLUMN "gross" SET DEFAULT '0',
ALTER COLUMN "winCount" DROP NOT NULL,
ALTER COLUMN "winCount" SET DEFAULT '0',
ALTER COLUMN "lossCount" DROP NOT NULL,
ALTER COLUMN "lossCount" SET DEFAULT '0',
ALTER COLUMN "winRate" DROP NOT NULL,
ALTER COLUMN "winRate" SET DEFAULT '0',
ALTER COLUMN "winPercentage" DROP NOT NULL,
ALTER COLUMN "winPercentage" SET DEFAULT '0',
ALTER COLUMN "avgVolume" DROP NOT NULL,
ALTER COLUMN "date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralLink" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "creator" TEXT,
    "owner" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "ReactionType",
    "commentId" TEXT,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_id_key" ON "Referral"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_link_key" ON "Referral"("link");

-- CreateIndex
CREATE UNIQUE INDEX "FiatWallet_userId_fiatId_key" ON "FiatWallet"("userId", "fiatId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralLink_key" ON "User"("referralLink");

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "Trader"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feed" ADD CONSTRAINT "Feed_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
