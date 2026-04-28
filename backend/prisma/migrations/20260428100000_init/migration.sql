CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('ADMIN_IMOBILIARIA', 'CORRETOR');
CREATE TYPE "PropertyType" AS ENUM ('NOVO', 'USADO', 'PLANTA');
CREATE TYPE "PropertyPurpose" AS ENUM ('VENDA', 'ALUGUEL');
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'INATIVO');
CREATE TYPE "PropertyCity" AS ENUM ('VALPARAISO', 'LUZIANIA', 'CIDADE_OCIDENTAL', 'JARDIM_INGA');
CREATE TYPE "PropertyRequestStatus" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO');

CREATE TABLE "RealEstate" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "mainCity" "PropertyCity" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RealEstate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "realEstateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrokerProfile" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "creci" TEXT,
  "phone" TEXT,
  "userId" TEXT NOT NULL,
  "realEstateId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BrokerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyRequest" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "PropertyType" NOT NULL,
  "purpose" "PropertyPurpose" NOT NULL,
  "status" "PropertyRequestStatus" NOT NULL DEFAULT 'PENDENTE',
  "rejectionReason" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "city" "PropertyCity" NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "areaM2" DECIMAL(10,2) NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" INTEGER NOT NULL,
  "parkingSpaces" INTEGER NOT NULL,
  "acceptsFinancing" BOOLEAN NOT NULL DEFAULT false,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "brokerProfileId" TEXT NOT NULL,
  "realEstateId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PropertyRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Property" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "PropertyType" NOT NULL,
  "purpose" "PropertyPurpose" NOT NULL,
  "status" "PropertyStatus" NOT NULL DEFAULT 'DISPONIVEL',
  "price" DECIMAL(12,2) NOT NULL,
  "city" "PropertyCity" NOT NULL,
  "neighborhood" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "areaM2" DECIMAL(10,2) NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" INTEGER NOT NULL,
  "parkingSpaces" INTEGER NOT NULL,
  "acceptsFinancing" BOOLEAN NOT NULL DEFAULT false,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "realEstateId" TEXT NOT NULL,
  "brokerId" TEXT,
  "sourceRequestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyImage" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "url" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PropertyRequestImage" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "url" TEXT NOT NULL,
  "propertyRequestId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyRequestImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RealEstate_cnpj_key" ON "RealEstate"("cnpj");
CREATE UNIQUE INDEX "RealEstate_email_key" ON "RealEstate"("email");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "BrokerProfile_userId_key" ON "BrokerProfile"("userId");
CREATE UNIQUE INDEX "Property_sourceRequestId_key" ON "Property"("sourceRequestId");

ALTER TABLE "User" ADD CONSTRAINT "User_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BrokerProfile" ADD CONSTRAINT "BrokerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrokerProfile" ADD CONSTRAINT "BrokerProfile_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_sourceRequestId_fkey" FOREIGN KEY ("sourceRequestId") REFERENCES "PropertyRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyRequest" ADD CONSTRAINT "PropertyRequest_brokerProfileId_fkey" FOREIGN KEY ("brokerProfileId") REFERENCES "BrokerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PropertyRequest" ADD CONSTRAINT "PropertyRequest_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PropertyRequestImage" ADD CONSTRAINT "PropertyRequestImage_propertyRequestId_fkey" FOREIGN KEY ("propertyRequestId") REFERENCES "PropertyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
