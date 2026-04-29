import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { Property } from "../types";

export function CustomerFavorites() {
  const [favorites, setFavorites] = useState<Property[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setFavorites(await api<Property[]>("/favorites"));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <p className="font-semibold text-primary">Área do cliente</p>
        <h1 className="text-3xl font-bold">Meus favoritos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acompanhe os imóveis que você marcou para ver novamente depois.</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Heart className="h-10 w-10 text-primary" />
            <p className="text-lg font-bold">Nenhum imóvel favoritado ainda.</p>
            <p className="max-w-md text-sm text-muted-foreground">Volte ao catálogo e clique em Favoritar nos imóveis que chamarem sua atenção.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} isFavorite onChanged={loadFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}
