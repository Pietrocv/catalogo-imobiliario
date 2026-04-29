ALTER TYPE "UserRole" ADD VALUE 'CLIENTE';

CREATE TABLE "FavoriteProperty" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FavoriteProperty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoriteProperty_userId_propertyId_key" ON "FavoriteProperty"("userId", "propertyId");

ALTER TABLE "FavoriteProperty"
ADD CONSTRAINT "FavoriteProperty_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FavoriteProperty"
ADD CONSTRAINT "FavoriteProperty_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
