import { Bath, BedDouble, Car, Edit, MapPin, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Property } from "../types";
import { cityLabels, money } from "../utils/labels";
import imperioLogo from "../assets/imperiologo.jpg";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FavoriteButton } from "./FavoriteButton";

export function PropertyCard({ property, onChanged, isFavorite }: { property: Property; onChanged?: () => void; isFavorite?: boolean }) {
  const { user } = useAuth();
  const image = property.images[0]?.url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
  const brokerAvatar = property.broker?.brokerProfile?.avatarUrl || imperioLogo;
  const brokerName = property.broker?.name || property.realEstate.name;
  const isAdmin = user?.role === "ADMIN_IMOBILIARIA";

  async function removeProperty() {
    const confirmed = window.confirm("Deseja remover este imóvel? Ele deixará de aparecer no catálogo público.");
    if (!confirmed) return;
    await api(`/properties/${property.id}`, { method: "DELETE" });
    onChanged?.();
  }

  return (
    <Card className="overflow-hidden">
      <img src={image} alt={property.title} className="h-52 w-full object-cover" />
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            {property.type} · {property.purpose}
          </p>
          <h3 className="line-clamp-2 text-lg font-bold">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {cityLabels[property.city]}, {property.neighborhood}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-[#D3AA53]/20 bg-[#111214]/50 p-2">
          <img src={brokerAvatar} alt={brokerName} className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Captado por</p>
            <p className="truncate text-sm font-semibold">{brokerName}</p>
          </div>
        </div>
        <p className="text-2xl font-bold">{money(property.price)}</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Car className="h-4 w-4" />
            {property.parkingSpaces}
          </span>
        </div>
        {property.availableUnits?.length > 0 && (
          <p className="rounded-md border border-primary/20 bg-[#111214]/50 px-3 py-2 text-sm font-semibold text-primary">
            {property.availableUnits.length} unidades disponíveis
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <Link to={`/properties/${property.id}`} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
            Ver detalhes
          </Link>
          <FavoriteButton propertyId={property.id} initialFavorited={isFavorite} onChanged={onChanged} className="w-full" />
        </div>
        {isAdmin && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/admin/imoveis/${property.id}/editar`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold transition hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Link>
            <Button type="button" variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={removeProperty}>
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
