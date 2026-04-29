ALTER TYPE "PropertyPurpose" RENAME TO "PropertyPurpose_old";
CREATE TYPE "PropertyPurpose" AS ENUM ('VENDA');

ALTER TABLE "Property" ALTER COLUMN "purpose" DROP DEFAULT;
ALTER TABLE "PropertyRequest" ALTER COLUMN "purpose" DROP DEFAULT;

ALTER TABLE "Property"
ALTER COLUMN "purpose" TYPE "PropertyPurpose"
USING "purpose"::text::"PropertyPurpose";

ALTER TABLE "PropertyRequest"
ALTER COLUMN "purpose" TYPE "PropertyPurpose"
USING "purpose"::text::"PropertyPurpose";

DROP TYPE "PropertyPurpose_old";

ALTER TYPE "PropertyStatus" RENAME TO "PropertyStatus_old";
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'INATIVO');

ALTER TABLE "Property" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Property"
ALTER COLUMN "status" TYPE "PropertyStatus"
USING "status"::text::"PropertyStatus";

ALTER TABLE "Property" ALTER COLUMN "status" SET DEFAULT 'DISPONIVEL';

DROP TYPE "PropertyStatus_old";
