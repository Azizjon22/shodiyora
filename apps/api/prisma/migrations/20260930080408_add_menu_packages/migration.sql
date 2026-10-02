-- CreateEnum
CREATE TYPE "MenuPackageType" AS ENUM ('FULL', 'FOOD_ONLY');

-- AlterTable: add the new package columns (price starts nullable so we can
-- backfill it from the old per-person rate before making it required).
ALTER TABLE "menus"
  ADD COLUMN "price" DECIMAL(14,2),
  ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "packageType" "MenuPackageType" NOT NULL DEFAULT 'FOOD_ONLY';

-- Data migration: existing menus were priced per person with no fixed
-- guest count — treat them as their equivalent 100-guest package (the new
-- guestCount default already covers this).
UPDATE "menus" SET "price" = "pricePerPerson" * 100;

-- AlterTable: price is now backfilled for every row, make it required.
ALTER TABLE "menus" ALTER COLUMN "price" SET NOT NULL;

-- AlterTable: drop the old per-person rate.
ALTER TABLE "menus" DROP COLUMN "pricePerPerson";
