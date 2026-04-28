import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const realEstate = await prisma.realEstate.upsert({
    where: { cnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      name: "Império Imóveis",
      cnpj: "12.345.678/0001-90",
      phone: "(61) 99999-0000",
      email: "contato@imperioimoveis.com.br",
      mainCity: "VALPARAISO"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@imperio.com" },
    update: {},
    create: {
      name: "Admin Império",
      email: "admin@imperio.com",
      passwordHash,
      role: "ADMIN_IMOBILIARIA",
      realEstateId: realEstate.id
    }
  });

  const brokers = await Promise.all(
    [
      { name: "Carla Souza", email: "carla@imperio.com", creci: "CRECI-GO 12345", phone: "(61) 98888-1111" },
      { name: "Rafael Lima", email: "rafael@imperio.com", creci: "CRECI-GO 67890", phone: "(61) 97777-2222" }
    ].map((broker) =>
      prisma.user.upsert({
        where: { email: broker.email },
        update: {},
        create: {
          name: broker.name,
          email: broker.email,
          passwordHash,
          role: "CORRETOR",
          realEstateId: realEstate.id,
          brokerProfile: {
            create: {
              realEstateId: realEstate.id,
              creci: broker.creci,
              phone: broker.phone
            }
          }
        },
        include: { brokerProfile: true }
      })
    )
  );

  const existingProperties = await prisma.property.count({ where: { realEstateId: realEstate.id } });
  if (existingProperties === 0) {
    const properties = [
      {
        title: "Casa nova no Parque Esplanada",
        description: "Casa recém-construída, bem ventilada, com suíte e espaço gourmet.",
        type: "NOVO" as const,
        purpose: "VENDA" as const,
        status: "DISPONIVEL" as const,
        price: 420000,
        city: "VALPARAISO" as const,
        neighborhood: "Parque Esplanada",
        address: "Rua das Palmeiras, 120",
        areaM2: 118,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 2,
        acceptsFinancing: true,
        featured: true,
        brokerId: brokers[0].id,
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      {
        title: "Apartamento usado no Centro",
        description: "Apartamento bem localizado, próximo a comércio, escolas e transporte público.",
        type: "USADO" as const,
        purpose: "VENDA" as const,
        status: "DISPONIVEL" as const,
        price: 260000,
        city: "LUZIANIA" as const,
        neighborhood: "Centro",
        address: "Avenida Principal, 450",
        areaM2: 72,
        bedrooms: 2,
        bathrooms: 1,
        parkingSpaces: 1,
        acceptsFinancing: true,
        featured: false,
        brokerId: brokers[1].id,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"]
      },
      {
        title: "Lançamento residencial em Cidade Ocidental",
        description: "Empreendimento na planta com lazer completo e condições facilitadas.",
        type: "PLANTA" as const,
        purpose: "VENDA" as const,
        status: "DISPONIVEL" as const,
        price: 198000,
        city: "CIDADE_OCIDENTAL" as const,
        neighborhood: "Recreio Mossoró",
        address: "Quadra 18, lote 08",
        areaM2: 55,
        bedrooms: 2,
        bathrooms: 1,
        parkingSpaces: 1,
        acceptsFinancing: true,
        featured: true,
        brokerId: brokers[0].id,
        images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"]
      },
      {
        title: "Casa para aluguel em Jardim Ingá",
        description: "Casa funcional para locação, com quintal privativo e garagem coberta.",
        type: "USADO" as const,
        purpose: "ALUGUEL" as const,
        status: "DISPONIVEL" as const,
        price: 1800,
        city: "JARDIM_INGA" as const,
        neighborhood: "Jardim Ingá",
        address: "Rua 7, casa 14",
        areaM2: 90,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 1,
        acceptsFinancing: false,
        featured: false,
        brokerId: brokers[1].id,
        images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80"]
      }
    ];

    for (const property of properties) {
      await prisma.property.create({
        data: {
          ...property,
          realEstateId: realEstate.id,
          images: { create: property.images.map((url) => ({ url })) }
        }
      });
    }
  }

  console.log("Seed concluído. Login admin@imperio.com / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
