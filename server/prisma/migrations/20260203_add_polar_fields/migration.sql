-- AlterTable
ALTER TABLE "User" ADD COLUMN "polarCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "polarSubscriptionId" TEXT;
ALTER TABLE "Subscription" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_polarCustomerId_key" ON "User"("polarCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_polarSubscriptionId_key" ON "Subscription"("polarSubscriptionId");
