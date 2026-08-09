-- AlterTable
ALTER TABLE "MerchantApplication" ADD COLUMN     "birUrl" TEXT,
ADD COLUMN     "businessPermitUrl" TEXT;

-- AlterTable
ALTER TABLE "RiderProfile" ADD COLUMN     "authLetterUrl" TEXT,
ADD COLUMN     "licenseUrl" TEXT,
ADD COLUMN     "orCrUrl" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
