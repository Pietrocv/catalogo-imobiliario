ALTER TABLE "Property" ADD COLUMN "commissionPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "PropertyRequest" ADD COLUMN "commissionPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE "Agio" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "PropertyStatus" NOT NULL DEFAULT 'DISPONIVEL',
  "price" DECIMAL(12,2) NOT NULL,
  "commissionPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "installmentAmount" DECIMAL(12,2) NOT NULL,
  "outstandingBalance" DECIMAL(12,2) NOT NULL,
  "roomInfo" TEXT NOT NULL,
  "areaM2" DECIMAL(10,2) NOT NULL,
  "plannedFurniture" BOOLEAN NOT NULL DEFAULT false,
  "hasDebtsOrProcurations" BOOLEAN NOT NULL DEFAULT false,
  "debtNotes" TEXT,
  "firstOwner" BOOLEAN NOT NULL DEFAULT false,
  "paidInstallments" INTEGER NOT NULL,
  "city" "PropertyCity" NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "mapUrl" TEXT,
  "condominiumName" TEXT NOT NULL,
  "realEstateId" TEXT NOT NULL,
  "brokerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Agio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgioImage" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "agioId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgioImage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Agio" ADD CONSTRAINT "Agio_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Agio" ADD CONSTRAINT "Agio_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgioImage" ADD CONSTRAINT "AgioImage_agioId_fkey" FOREIGN KEY ("agioId") REFERENCES "Agio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
