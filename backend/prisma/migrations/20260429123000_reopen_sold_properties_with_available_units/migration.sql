UPDATE "Property" p
SET
  "status" = 'DISPONIVEL',
  "soldById" = NULL,
  "soldAt" = NULL
WHERE
  p."status" = 'VENDIDO'
  AND EXISTS (
    SELECT 1
    FROM "PropertyUnit" u
    WHERE u."propertyId" = p."id"
      AND u."status" = 'DISPONIVEL'
  );
