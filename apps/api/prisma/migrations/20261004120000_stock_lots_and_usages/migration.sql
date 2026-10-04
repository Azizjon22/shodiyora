-- AlterEnum
ALTER TYPE "EventExpenseCategory" ADD VALUE 'STOCK';

-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_createdById_fkey";

-- AlterTable
ALTER TABLE "inventory_transactions" ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateTable
CREATE TABLE "inventory_lots" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unitPrice" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_usages" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "telegramMessages" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_usage_items" (
    "id" TEXT NOT NULL,
    "usageId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "Unit" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "totalCost" DECIMAL(14,2),
    "allocations" JSONB NOT NULL,

    CONSTRAINT "stock_usage_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_lots_itemId_createdAt_idx" ON "inventory_lots"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_usages_eventId_idx" ON "stock_usages"("eventId");

-- CreateIndex
CREATE INDEX "stock_usage_items_usageId_idx" ON "stock_usage_items"("usageId");

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_usages" ADD CONSTRAINT "stock_usages_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_usages" ADD CONSTRAINT "stock_usages_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_usage_items" ADD CONSTRAINT "stock_usage_items_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "stock_usages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_usage_items" ADD CONSTRAINT "stock_usage_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Data migration: stock already on the shelves becomes one opening lot per
-- item, unpriced until the super admin enters what it cost.
INSERT INTO "inventory_lots" ("id", "itemId", "quantity", "unitPrice", "createdAt")
SELECT 'lot_' || "id", "id", "quantity", NULL, "createdAt"
FROM "inventory_items"
WHERE "quantity" > 0;
