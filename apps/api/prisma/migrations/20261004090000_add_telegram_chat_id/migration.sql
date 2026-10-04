-- AlterTable
ALTER TABLE "staff_users" ADD COLUMN "telegramChatId" TEXT;

-- AlterTable
ALTER TABLE "workers" ADD COLUMN "telegramChatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "staff_users_telegramChatId_key" ON "staff_users"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "workers_telegramChatId_key" ON "workers"("telegramChatId");
