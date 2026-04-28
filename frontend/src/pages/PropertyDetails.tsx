import { Bath, BedDouble, Car, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { Property } from "../types";
import { cityLabels, money } from "../utils/labels";

export function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    api<Property>(`/properties/${id}`).then(setProperty);
  }, [id]);

  if (!property) return <div className="mx-auto max-w-7xl px-4 py-10">Carregando...</div>;
  const images = property.images.length ? property.images : [{ id: "fallback", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" }];

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
          <p className="font-semibold text-primary">{property.type} · {property.purpose} · {property.status}</p>
          <h1 className="mt-2 text-3xl font-bold">{property.title}</h1>
          <p className="mt-2 text-muted-foreground">{cityLabels[property.city]}, {property.neighborhood} · {property.address}</p>
          <p className="mt-5 text-3xl font-bold">{money(property.price)}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info icon={<Ruler />} label={`${property.areaM2} m²`} />
            <Info icon={<BedDouble />} label={`${property.bedrooms} quartos`} />
            <Info icon={<Bath />} label={`${property.bathrooms} banheiros`} />
            <Info icon={<Car />} label={`${property.parkingSpaces} vagas`} />
          </div>
          <p className="mt-6 leading-7">{property.description}</p>
          <p className="mt-4 font-semibold">{property.acceptsFinancing ? "Aceita financiamento" : "Não aceita financiamento"}</p>
        </section>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold">Atendimento</h2>
            <div>
              <p className="font-semibold">{property.realEstate.name}</p>
              <p className="text-sm text-muted-foreground">{property.realEstate.phone}</p>
              <p className="text-sm text-muted-foreground">{property.realEstate.email}</p>
            </div>
            {property.broker && (
              <div className="border-t border-border pt-4">
                <p className="font-semibold">{property.broker.name}</p>
                <p className="text-sm text-muted-foreground">{property.broker.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-lg border border-border bg-white p-3 text-sm font-semibold">{icon}{label}</div>;
}
