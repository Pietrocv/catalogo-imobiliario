import { Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { api } from "../services/api";
import type { Property } from "../types";
import { cities } from "../utils/labels";

export function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load(query = "") {
    setProperties(await api<Property[]>(`/properties${query}`));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    load(`?${params.toString()}`);
  }

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-primary">Império Imóveis e parceiros</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-normal md:text-5xl">Catálogo de imóveis no Entorno Sul de Brasília</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Encontre casas, apartamentos e lançamentos em Valparaíso, Luziânia, Cidade Ocidental e Jardim Ingá.</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
            alt="Fachada residencial moderna"
            className="h-72 w-full rounded-lg object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-4 lg:grid-cols-8">
          <Select onChange={(e) => setFilters({ ...filters, city: e.target.value })} defaultValue="">
            <option value="">Cidade</option>
            {cities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select onChange={(e) => setFilters({ ...filters, type: e.target.value })} defaultValue="">
            <option value="">Tipo</option>
            <option value="NOVO">Novo</option>
            <option value="USADO">Usado</option>
            <option value="PLANTA">Na planta</option>
          </Select>
          <Select onChange={(e) => setFilters({ ...filters, purpose: e.target.value })} defaultValue="">
            <option value="">Finalidade</option>
            <option value="VENDA">Venda</option>
            <option value="ALUGUEL">Aluguel</option>
          </Select>
          <Input placeholder="Preço mín." type="number" onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          <Input placeholder="Preço máx." type="number" onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          <Input placeholder="Quartos mín." type="number" onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value })} />
          <Select onChange={(e) => setFilters({ ...filters, acceptsFinancing: e.target.value })} defaultValue="">
            <option value="">Financiamento</option>
            <option value="true">Aceita</option>
          </Select>
          <Button className="gap-2"><Search className="h-4 w-4" />Filtrar</Button>
        </form>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      </section>
    </div>
  );
}
