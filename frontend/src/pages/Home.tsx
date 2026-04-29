import { FormEvent, useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyHeroCarousel } from "../components/PropertyHeroCarousel";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { api } from "../services/api";
import type { Property } from "../types";
import { cities } from "../utils/labels";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user?.role === "CLIENTE") {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.role]);

  async function load(query = "") {
    setProperties(await api<Property[]>(`/properties${query}`));
  }

  async function loadFavorites() {
    setFavorites(await api<Property[]>("/favorites"));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    load(`?${params.toString()}`);
  }

  function setFilter(name: string, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearAdvanced() {
    setFilters(({ city, type, search }) => ({ city, type, search }));
  }

  function reloadWithCurrentFilters() {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    load(`?${params.toString()}`);
    if (user?.role === "CLIENTE") loadFavorites();
  }

  return (
    <div>
      <section className="border-b border-[#D3AA53]/20 bg-[#111214]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-[#D3AA53]">Império Imóveis e parceiros</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-normal text-[#ECECEC] md:text-5xl">Catálogo de imóveis no Entorno Sul de Brasília</h1>
            <p className="mt-4 max-w-2xl text-lg text-[#ECECEC]/75">Encontre casas, apartamentos e lançamentos em Valparaíso, Luziânia, Cidade Ocidental e Jardim Ingá.</p>
          </div>
          <PropertyHeroCarousel properties={properties} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form onSubmit={submit} className="rounded-lg border border-[#D3AA53]/30 bg-[#17191c] p-4 shadow-lg shadow-black/20">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por título, bairro ou endereço"
                value={filters.search ?? ""}
                onChange={(event) => setFilter("search", event.target.value)}
              />
            </div>
            <Select onChange={(event) => setFilter("city", event.target.value)} value={filters.city ?? ""}>
              <option value="">Cidade</option>
              {cities.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setFilter("type", event.target.value)} value={filters.type ?? ""}>
              <option value="">Tipo</option>
              <option value="NOVO">Novo</option>
              <option value="USADO">Usado</option>
              <option value="PLANTA">Na planta</option>
            </Select>
            <Button type="button" variant="outline" className="gap-2" onClick={() => setAdvancedOpen((open) => !open)}>
              <SlidersHorizontal className="h-4 w-4" />
              Mais filtros
            </Button>
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Filtrar
            </Button>
          </div>

          {advancedOpen && (
            <div className="mt-4 rounded-md border border-[#D3AA53]/25 bg-[#111214] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold">Filtros avançados</h2>
                <Button type="button" variant="ghost" className="h-8 gap-2 px-2" onClick={() => setAdvancedOpen(false)}>
                  <X className="h-4 w-4" />
                  Fechar
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input placeholder="Preço mín." type="number" value={filters.minPrice ?? ""} onChange={(event) => setFilter("minPrice", event.target.value)} />
                <Input placeholder="Preço máx." type="number" value={filters.maxPrice ?? ""} onChange={(event) => setFilter("maxPrice", event.target.value)} />
                <Input placeholder="Quartos mín." type="number" value={filters.minBedrooms ?? ""} onChange={(event) => setFilter("minBedrooms", event.target.value)} />
                <Input placeholder="Banheiros mín." type="number" value={filters.minBathrooms ?? ""} onChange={(event) => setFilter("minBathrooms", event.target.value)} />
                <Input placeholder="Vagas mín." type="number" value={filters.minParkingSpaces ?? ""} onChange={(event) => setFilter("minParkingSpaces", event.target.value)} />
                <Select value={filters.acceptsFinancing ?? ""} onChange={(event) => setFilter("acceptsFinancing", event.target.value)}>
                  <option value="">Financiamento</option>
                  <option value="true">Aceita financiamento</option>
                  <option value="false">Não aceita</option>
                </Select>
                <Select value={filters.featured ?? ""} onChange={(event) => setFilter("featured", event.target.value)}>
                  <option value="">Destaque</option>
                  <option value="true">Somente destaques</option>
                </Select>
                <Button type="button" variant="outline" onClick={clearAdvanced}>
                  Limpar avançados
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.some((favorite) => favorite.id === property.id)}
              onChanged={reloadWithCurrentFilters}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
