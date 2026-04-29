export type UserRole = "ADMIN_IMOBILIARIA" | "CORRETOR" | "CLIENTE";
export type PropertyCity = "VALPARAISO" | "LUZIANIA" | "CIDADE_OCIDENTAL" | "JARDIM_INGA";
export type PropertyType = "NOVO" | "USADO" | "PLANTA";
export type PropertyPurpose = "VENDA";
export type PropertyStatus = "DISPONIVEL" | "RESERVADO" | "VENDIDO" | "INATIVO";
export type PropertyRequestStatus = "PENDENTE" | "APROVADO" | "RECUSADO";

export type RealEstate = {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  mainCity: PropertyCity;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  realEstateId: string | null;
  realEstate?: RealEstate;
  brokerProfile?: {
    creci?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    linkedAt?: string;
  } | null;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number;
  commissionPrice: number;
  city: PropertyCity;
  neighborhood: string;
  address: string;
  mapUrl?: string | null;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  availableUnits: string[];
  acceptsFinancing: boolean;
  featured: boolean;
  images: { id: string; url: string }[];
  realEstate: RealEstate;
  broker?: User | null;
  brokerId?: string | null;
  soldBy?: User | null;
  soldById?: string | null;
  soldAt?: string | null;
  units: PropertyUnit[];
  createdAt: string;
  updatedAt: string;
};

export type PropertyUnit = {
  id: string;
  label: string;
  status: "DISPONIVEL" | "VENDIDO";
  soldBy?: User | null;
  soldById?: string | null;
  soldByExternalName?: string | null;
  soldAt?: string | null;
};

export type PropertyRequest = Omit<Property, "id" | "status" | "images" | "realEstate" | "broker"> & {
  id: string;
  status: PropertyRequestStatus;
  rejectionReason?: string | null;
  images: { id: string; url: string }[];
  realEstate: RealEstate;
  brokerProfile: { user: User };
};

export type Agio = {
  id: string;
  title: string;
  description: string;
  status: PropertyStatus;
  price: number;
  commissionPrice: number;
  installmentAmount: number;
  outstandingBalance: number;
  roomInfo: string;
  areaM2: number;
  plannedFurniture: boolean;
  hasDebtsOrProcurations: boolean;
  debtNotes?: string | null;
  firstOwner: boolean;
  paidInstallments: number;
  city: PropertyCity;
  neighborhood: string;
  address: string;
  mapUrl?: string | null;
  condominiumName: string;
  images: { id: string; url: string }[];
  realEstate: RealEstate;
  broker?: User | null;
  brokerId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SalesControl = {
  id: string;
  clientCpf: string;
  propertyName: string;
  clientName: string;
  builder?: string | null;
  saleDate: string;
  cca?: string | null;
  signatureDate?: string | null;
  dispatcherPaid: boolean;
  paymentMethod?: string | null;
  notes?: string | null;
  realEstateId: string;
  createdAt: string;
  updatedAt: string;
};

export type LinkedBroker = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  creci: string | null;
  linkedAt: string;
  propertiesCount: number;
  requestsCount: number;
};

export type BrokerInvite = {
  token: string;
  inviteUrl?: string;
  expiresAt: string;
  realEstate: RealEstate;
};
