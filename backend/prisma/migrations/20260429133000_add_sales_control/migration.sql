CREATE TABLE "SalesControl" (
  "id" TEXT NOT NULL,
  "clientCpf" TEXT NOT NULL,
  "propertyName" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "builder" TEXT,
  "saleDate" TIMESTAMP(3) NOT NULL,
  "cca" TEXT,
  "signatureDate" TIMESTAMP(3),
  "dispatcherPaid" BOOLEAN NOT NULL DEFAULT false,
  "paymentMethod" TEXT,
  "notes" TEXT,
  "realEstateId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesControl_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SalesControl" ADD CONSTRAINT "SalesControl_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
