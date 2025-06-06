-- DropIndex
DROP INDEX "FiatWallet_userId_fiatId_key";

-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "isApproved" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Trader" ADD COLUMN     "photo" TEXT;
