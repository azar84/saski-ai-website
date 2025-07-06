-- AlterTable
ALTER TABLE "feature_groups" ALTER COLUMN "backgroundColor" DROP NOT NULL,
ALTER COLUMN "backgroundColor" SET DEFAULT '#FFFFFF';

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "gaMeasurementId" TEXT,
ADD COLUMN     "gtmContainerId" TEXT,
ADD COLUMN     "gtmEnabled" BOOLEAN NOT NULL DEFAULT false;
