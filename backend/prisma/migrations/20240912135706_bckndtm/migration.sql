/*
  Warnings:

  - You are about to drop the column `coinId` on the `CryptoTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CryptoTransaction" DROP CONSTRAINT "CryptoTransaction_coinId_fkey";

-- AlterTable
ALTER TABLE "CryptoTransaction" DROP COLUMN "coinId",
ADD COLUMN     "tokenAddress" TEXT,
ADD COLUMN     "tokenSymbol" TEXT,
ALTER COLUMN "txreceipt_status" DROP NOT NULL,
ALTER COLUMN "methodId" DROP NOT NULL,
ALTER COLUMN "confirmations" SET DATA TYPE TEXT;
