UPDATE "Property"
SET "purpose" = 'VENDA'
WHERE "purpose" = 'ALUGUEL';

UPDATE "PropertyRequest"
SET "purpose" = 'VENDA'
WHERE "purpose" = 'ALUGUEL';

UPDATE "Property"
SET "status" = 'VENDIDO'
WHERE "status" = 'ALUGADO';
