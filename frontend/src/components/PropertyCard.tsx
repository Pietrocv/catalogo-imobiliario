import { Bath, BedDouble, Car, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "../types";
import { cityLabels, money } from "../utils/labels";
import { Card, CardContent } from "./ui/card";

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images[0]?.url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

  return (
    <Card className="overflow-hidden">
      <img src={image} alt={property.title} className="h-52 w-full object-cover" />
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-primary">{property.type} · {property.purpose}</p>
          <h3 className="line-clamp-2 text-lg font-bold">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {cityLabels[property.city]}, {property.neighborhood}
          </p>
        </div>
        <p className="text-2xl font-bold">{money(property.price)}</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.bathrooms}</span>
          <span className="flex items-center gap-1"><Car className="h-4 w-4" />{property.parkingSpaces}</span>
        </div>
        <Link to={`/properties/${property.id}`} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
          Ver detalhes
        </Link>
      </CardContent>
    </Card>
  );
}
