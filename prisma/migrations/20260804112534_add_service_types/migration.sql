-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('GROCERY', 'PABILI', 'PADALA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "itemDescription" TEXT,
ADD COLUMN     "maxAmount" DOUBLE PRECISION,
ADD COLUMN     "packageDescription" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "receiverAddress" TEXT,
ADD COLUMN     "receiverContact" TEXT,
ADD COLUMN     "receiverName" TEXT,
ADD COLUMN     "senderAddress" TEXT,
ADD COLUMN     "senderContact" TEXT,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'GROCERY',
ADD COLUMN     "storeLocation" TEXT,
ALTER COLUMN "totalAmount" DROP NOT NULL,
ALTER COLUMN "deliveryFee" DROP NOT NULL,
ALTER COLUMN "riderPayout" DROP NOT NULL,
ALTER COLUMN "requiredLoadKg" DROP NOT NULL,
ALTER COLUMN "deliveryAddress" DROP NOT NULL,
ALTER COLUMN "contactNumber" DROP NOT NULL;
