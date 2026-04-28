CREATE TABLE "BrokerInvite" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "token" TEXT NOT NULL,
  "realEstateId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BrokerInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BrokerInvite_token_key" ON "BrokerInvite"("token");

ALTER TABLE "BrokerInvite" ADD CONSTRAINT "BrokerInvite_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrokerInvite" ADD CONSTRAINT "BrokerInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
