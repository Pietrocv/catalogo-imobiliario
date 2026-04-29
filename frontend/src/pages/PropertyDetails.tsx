import { Bath, BedDouble, Car, MapPinned, MessageCircle, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { MediaDownloadButton } from "../components/MediaDownloadButton";
import { FavoriteButton } from "../components/FavoriteButton";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Property } from "../types";
import { cityLabels, money } from "../utils/labels";
import imperioLogo from "../assets/imperiologo.jpg";

export function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    api<Property>(`/properties/${id}`).then(setProperty);
  }, [id]);

  useEffect(() => {
    if (user?.role === "CLIENTE") {
      api<Property[]>("/favorites").then((favorites) => setFavoriteIds(favorites.map((favorite) => favorite.id)));
    } else {
      setFavoriteIds([]);
    }
  }, [user?.role]);

  if (!property) return <div className="mx-auto max-w-7xl px-4 py-10">Carregando...</div>;

  const images = property.images.length ? property.images : [{ id: "fallback", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" }];
  const brokerAvatar = property.broker?.brokerProfile?.avatarUrl || imperioLogo;
  const brokerName = property.broker?.name || property.realEstate.name;
  const whatsappMessage = buildPropertyWhatsAppMessage(property);
  const brokerWhatsApp = buildWhatsAppUrl(property.broker?.brokerProfile?.phone, whatsappMessage);
  const realEstateWhatsApp = buildWhatsAppUrl(property.realEstate.phone, whatsappMessage);
  const canDownloadMedia = user?.role === "CORRETOR" || user?.role === "ADMIN_IMOBILIARIA";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-3">
        <img src={images[0].url} alt={property.title} className="h-96 w-full rounded-lg object-cover md:col-span-2" />
        <div className="grid gap-4">
          {images.slice(1, 3).map((image) => <img key={image.id} src={image.url} alt="" className="h-44 w-full rounded-lg object-cover" />)}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="font-semibold text-primary">
            {property.type} - {property.purpose} - {property.status}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{property.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {cityLabels[property.city]}, {property.neighborhood} - {property.address}
          </p>
          <p className="mt-5 text-3xl font-bold">{money(property.price)}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info icon={<Ruler />} label={`${property.areaM2} m²`} />
            <Info icon={<BedDouble />} label={`${property.bedrooms} quartos`} />
            <Info icon={<Bath />} label={`${property.bathrooms} banheiros`} />
            <Info icon={<Car />} label={`${property.parkingSpaces} vagas`} />
          </div>

          <p className="mt-6 leading-7">{property.description}</p>

          {property.availableUnits?.length > 0 && (
            <div className="mt-6 rounded-lg border border-[#D3AA53]/30 bg-[#17191c] p-4">
              <h2 className="text-lg font-bold">Unidades disponíveis</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.availableUnits.map((unit) => (
                  <span key={unit} className="rounded-md border border-primary/30 px-3 py-1 text-sm font-semibold text-primary">
                    Unidade {unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 font-semibold">{property.acceptsFinancing ? "Aceita financiamento" : "Não aceita financiamento"}</p>

          {property.mapUrl && (
            <a
              href={property.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <MapPinned className="h-4 w-4" />
              Ver no Google Maps
            </a>
          )}
        </section>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">Atendimento</h2>
            <FavoriteButton propertyId={property.id} initialFavorited={favoriteIds.includes(property.id)} className="w-full" />
            {canDownloadMedia && property.images.length > 0 && <MediaDownloadButton property={property} className="w-full" />}
            <div>
              <p className="font-semibold">{property.realEstate.name}</p>
              <p className="text-sm text-muted-foreground">{property.realEstate.phone}</p>
              <p className="text-sm text-muted-foreground">{property.realEstate.email}</p>
            </div>

            {property.status === "VENDIDO" && property.soldBy && (
              <div className="border-t border-border pt-4">
                <div className="mb-3 flex items-center gap-3">
                  <img src={property.soldBy.brokerProfile?.avatarUrl || imperioLogo} alt={property.soldBy.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-xs text-muted-foreground">Corretor que vendeu</p>
                    <p className="font-semibold">{property.soldBy.name}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{property.soldBy.email}</p>
                {property.soldBy.brokerProfile?.phone && <p className="text-sm text-muted-foreground">{property.soldBy.brokerProfile.phone}</p>}
                <p className="text-sm text-muted-foreground">{property.soldBy.brokerProfile?.creci || "CRECI não informado"}</p>
              </div>
            )}

            {property.broker && (
              <div className="border-t border-border pt-4">
                <div className="mb-3 flex items-center gap-3">
                  <img src={brokerAvatar} alt={brokerName} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-xs text-muted-foreground">Corretor captador</p>
                    <p className="font-semibold">{property.broker.name}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{property.broker.email}</p>
                {property.broker.brokerProfile?.phone && <p className="text-sm text-muted-foreground">{property.broker.brokerProfile.phone}</p>}
                <p className="text-sm text-muted-foreground">{property.broker.brokerProfile?.creci || "CRECI não informado"}</p>
                {brokerWhatsApp && <WhatsAppButton href={brokerWhatsApp} label="Enviar anúncio ao captador" />}
              </div>
            )}

            {!property.broker && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <img src={imperioLogo} alt={property.realEstate.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-xs text-muted-foreground">Responsável pelo anúncio</p>
                    <p className="font-semibold">{property.realEstate.name}</p>
                  </div>
                </div>
                {realEstateWhatsApp && <WhatsAppButton href={realEstateWhatsApp} label="Enviar anúncio no WhatsApp" />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#D3AA53]/30 bg-[#17191c] p-3 text-sm font-semibold text-[#ECECEC]">
      {icon}
      {label}
    </div>
  );
}

function WhatsAppButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-bold text-[#111214] transition hover:brightness-95"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}

function buildPropertyWhatsAppMessage(property: Property) {
  const propertyUrl = `${window.location.origin}/properties/${property.id}`;
  const lines = [
    `Olá! Tenho interesse neste imóvel da Império Imóveis:`,
    "",
    `*${property.title}*`,
    `Preço: ${money(property.price)}`,
    `Localização: ${cityLabels[property.city]}, ${property.neighborhood}`,
    `${property.bedrooms} quartos | ${property.bathrooms} banheiros | ${property.parkingSpaces} vagas`,
    `Área: ${property.areaM2} m²`,
    `Financiamento: ${property.acceptsFinancing ? "Aceita financiamento" : "Não aceita financiamento"}`,
    property.availableUnits?.length ? `Unidades disponíveis: ${property.availableUnits.join(", ")}` : "",
    "",
    `Veja fotos, localização e detalhes aqui:`,
    propertyUrl
  ];

  return lines.filter(Boolean).join("\n");
}

function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
