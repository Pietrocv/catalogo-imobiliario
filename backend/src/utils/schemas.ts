import { z } from "zod";

export const roleSchema = z.enum(["ADMIN_IMOBILIARIA", "CORRETOR", "CLIENTE"]);
export const citySchema = z.enum(["VALPARAISO", "LUZIANIA", "CIDADE_OCIDENTAL", "JARDIM_INGA"]);
export const typeSchema = z.enum(["NOVO", "USADO", "PLANTA"]);
export const purposeSchema = z.enum(["VENDA"]);
export const propertyStatusSchema = z.enum(["DISPONIVEL", "RESERVADO", "VENDIDO", "INATIVO"]);

export const imageUrlsSchema = z.array(z.string().url()).default([]);
export const availableUnitsSchema = z.array(z.string().trim().min(1)).default([]);

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema,
  realEstateId: z.string().uuid().optional(),
  creci: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().trim().min(8).optional(),
  creci: z.string().trim().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export const realEstateSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(11),
  phone: z.string().min(8),
  email: z.string().email(),
  mainCity: citySchema
});

export const propertyPayloadSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: typeSchema,
  purpose: purposeSchema,
  status: propertyStatusSchema.default("DISPONIVEL"),
  price: z.coerce.number().positive(),
  commissionPrice: z.coerce.number().min(0).default(0),
  city: citySchema,
  neighborhood: z.string().min(2),
  address: z.string().min(3),
  mapUrl: z.string().url().optional().or(z.literal("")),
  areaM2: z.coerce.number().positive(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  parkingSpaces: z.coerce.number().int().min(0),
  availableUnits: availableUnitsSchema,
  acceptsFinancing: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
  realEstateId: z.string().uuid().optional(),
  brokerId: z.string().uuid().optional(),
  soldById: z.string().uuid().optional().or(z.literal("")),
  images: imageUrlsSchema
});

export const propertyRequestPayloadSchema = propertyPayloadSchema.omit({
  status: true,
  realEstateId: true,
  brokerId: true,
  soldById: true,
  featured: true
});

export const propertyFiltersSchema = z.object({
  search: z.string().trim().optional(),
  city: citySchema.optional(),
  type: typeSchema.optional(),
  purpose: purposeSchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBedrooms: z.coerce.number().int().optional(),
  minBathrooms: z.coerce.number().int().optional(),
  minParkingSpaces: z.coerce.number().int().optional(),
  acceptsFinancing: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export const agioPayloadSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  status: propertyStatusSchema.default("DISPONIVEL"),
  price: z.coerce.number().positive(),
  commissionPrice: z.coerce.number().min(0).default(0),
  installmentAmount: z.coerce.number().positive(),
  outstandingBalance: z.coerce.number().min(0),
  roomInfo: z.string().min(3),
  areaM2: z.coerce.number().positive(),
  plannedFurniture: z.coerce.boolean().default(false),
  hasDebtsOrProcurations: z.coerce.boolean().default(false),
  debtNotes: z.string().trim().optional().or(z.literal("")),
  firstOwner: z.coerce.boolean().default(false),
  paidInstallments: z.coerce.number().int().min(0),
  city: citySchema,
  neighborhood: z.string().min(2),
  address: z.string().min(3),
  mapUrl: z.string().url().optional().or(z.literal("")),
  condominiumName: z.string().min(2),
  brokerId: z.string().uuid().optional(),
  realEstateId: z.string().uuid().optional(),
  images: imageUrlsSchema
});

export const agioFiltersSchema = z.object({
  search: z.string().trim().optional(),
  city: citySchema.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional()
});

export const rejectRequestSchema = z.object({
  reason: z.string().min(3)
});

export const sellPropertyUnitSchema = z.object({
  soldById: z.string().uuid().or(z.literal("EXTERNAL_PARTNER"))
});

export const salesControlSchema = z.object({
  clientCpf: z.string().trim().min(11),
  propertyName: z.string().trim().min(2),
  clientName: z.string().trim().min(2),
  builder: z.string().trim().optional().or(z.literal("")),
  saleDate: z.coerce.date(),
  cca: z.string().trim().optional().or(z.literal("")),
  signatureDate: z.coerce.date().optional().nullable(),
  dispatcherPaid: z.coerce.boolean().default(false),
  paymentMethod: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal(""))
});
