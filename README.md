# Catálogo Imobiliário

Projeto full stack para imobiliárias e corretores cadastrarem, aprovarem e divulgarem imóveis.

## Stack

- Backend: Node.js, Fastify, Prisma, PostgreSQL, JWT e Zod
- Frontend: React, Vite, TailwindCSS e componentes no padrão Shadcn UI
- Infra: Docker e Docker Compose

## Como rodar com Docker

```bash
cd catalogo-imobiliario
docker compose up --build
```

Serviços:

- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- PostgreSQL: localhost:5432

O container do backend executa `prisma migrate deploy` e o seed automaticamente ao iniciar.

## Acessos iniciais

Todos os usuários do seed usam a senha `123456`.

- Admin: `admin@imperio.com`
- Corretor: `carla@imperio.com`
- Corretor: `rafael@imperio.com`

## Rodando localmente sem Docker

Crie o arquivo `backend/.env` a partir de `backend/.env.example` e suba um PostgreSQL local.

```bash
npm run install:all
npm --prefix backend run prisma:deploy
npm --prefix backend run seed
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Endpoints principais

Auth:

- `POST /register`
- `POST /login`
- `GET /me`

Imobiliárias:

- `POST /real-estates`
- `GET /real-estates`
- `GET /real-estates/:id`
- `PATCH /real-estates/:id`

Corretores:

- `GET /brokers`
- `POST /brokers/link`
- `GET /brokers/me`

Imóveis:

- `GET /properties`
- `GET /properties/:id`
- `POST /properties`
- `PATCH /properties/:id`
- `DELETE /properties/:id`

Pedidos de imóveis:

- `POST /property-requests`
- `GET /property-requests`
- `GET /property-requests/:id`
- `PATCH /property-requests/:id`
- `POST /property-requests/:id/approve`
- `POST /property-requests/:id/reject`

## Fluxos implementados

- Visitante lista imóveis disponíveis e filtra por cidade, tipo, finalidade, preço, quartos e financiamento.
- Visitante abre detalhes do imóvel com galeria, atributos, imobiliária e corretor responsável.
- Admin faz login, vê dashboard, cria imóvel diretamente, altera status e aprova ou recusa pedidos.
- Corretor faz login, cria pedido de imóvel e acompanha o status e motivo de recusa.
- Ao aprovar um pedido, o backend cria automaticamente o imóvel no catálogo público.

## Estrutura

```text
backend/
  prisma/
  src/
    controllers/
    middlewares/
    prisma/
    routes/
    services/
    utils/
    app.ts
    server.ts

frontend/
  src/
    components/
    contexts/
    hooks/
    pages/
    routes/
    services/
    types/
```

## Observações

- As cidades são controladas por enum no Prisma: `VALPARAISO`, `LUZIANIA`, `CIDADE_OCIDENTAL`, `JARDIM_INGA`.
- Corretores não publicam imóveis diretamente; eles criam pedidos com status `PENDENTE`.
- A remoção de imóvel usa inativação lógica, alterando o status para `INATIVO`.
