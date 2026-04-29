ALTER TABLE "Property" ADD COLUMN "availableUnits" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "PropertyRequest" ADD COLUMN "availableUnits" TEXT[] DEFAULT ARRAY[]::TEXT[];
