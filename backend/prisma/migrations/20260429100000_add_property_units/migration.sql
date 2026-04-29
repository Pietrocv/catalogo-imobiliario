CREATE TYPE "PropertyUnitStatus" AS ENUM ('DISPONIVEL', 'VENDIDO');

CREATE TABLE "PropertyUnit" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "status" "PropertyUnitStatus" NOT NULL DEFAULT 'DISPONIVEL',
  "propertyId" TEXT NOT NULL,
  "soldById" TEXT,
  "soldByExternalName" TEXT,
  "soldAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PropertyUnit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PropertyUnit_propertyId_label_key" ON "PropertyUnit"("propertyId", "label");

ALTER TABLE "PropertyUnit"
ADD CONSTRAINT "PropertyUnit_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PropertyUnit"
ADD CONSTRAINT "PropertyUnit_soldById_fkey"
FOREIGN KEY ("soldById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "PropertyUnit" ("id", "label", "propertyId", "updatedAt")
SELECT gen_random_uuid()::text, unit_label, "id", CURRENT_TIMESTAMP
FROM "Property", unnest("availableUnits") AS unit_label
ON CONFLICT ("propertyId", "label") DO NOTHING;
