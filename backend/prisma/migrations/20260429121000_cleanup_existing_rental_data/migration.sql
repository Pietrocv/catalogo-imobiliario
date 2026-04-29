UPDATE "Property"
SET
  "title" = 'Casa usada em Jardim Inga',
  "description" = 'Casa funcional a venda, com quintal privativo e garagem coberta.',
  "price" = 285000,
  "acceptsFinancing" = true,
  "neighborhood" = 'Jardim Inga'
WHERE
  "title" ILIKE '%aluguel%'
  OR "description" ILIKE '%loca%';

UPDATE "PropertyRequest"
SET
  "title" = 'Casa usada em Jardim Inga',
  "description" = 'Casa funcional a venda, com quintal privativo e garagem coberta.',
  "price" = 285000,
  "acceptsFinancing" = true,
  "neighborhood" = 'Jardim Inga'
WHERE
  "title" ILIKE '%aluguel%'
  OR "description" ILIKE '%loca%';
