import { Edit, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Agio } from "../types";
import { cities, cityLabels, money } from "../utils/labels";

export function Agios() {
  const { user } = useAuth();
  const [agios, setAgios] = useState<Agio[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const isAdmin = user?.role === "ADMIN_IMOBILIARIA";
  const canSeeCommission = user?.role === "ADMIN_IMOBILIARIA" || user?.role === "CORRETOR";

  useEffect(() => {
    load();
  }, []);

  async function load(query = "") {
    setAgios(await api<Agio[]>(`/agios${query}`));
  }

  async function removeAgio(id: string) {
    const confirmed = window.confirm("Deseja remover este agio?");
    if (!confirmed) return;
    await api(`/agios/${id}`, { method: "DELETE" });
    await load();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    load(`?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <p className="font-semibold text-primary">Agios</p>
        <h1 className="text-3xl font-bold">Oportunidades de agio</h1>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-[#D3AA53]/30 bg-[#17191c] p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
        <Input placeholder="Buscar por titulo, condominio ou bairro" value={filters.search ?? ""} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <Select value={filters.city ?? ""} onChange={(event) => setFilters({ ...filters, city: event.target.value })}>
          <option value="">Cidade</option>
          {cities.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input placeholder="Preco min." type="number" value={filters.minPrice ?? ""} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} />
        <Input placeholder="Preco max." type="number" value={filters.maxPrice ?? ""} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} />
        <Button>Filtrar</Button>
      </form>

      <div className="grid gap-5 lg:grid-cols-3">
        {agios.map((agio) => {
          const image = agio.images[0]?.url ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
          return (
            <Card key={agio.id} className="overflow-hidden">
              <img src={image} alt={agio.title} className="h-52 w-full object-cover" />
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{agio.condominiumName}</p>
                  <h2 className="text-lg font-bold">{agio.title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {cityLabels[agio.city]}, {agio.neighborhood}
                  </p>
                </div>
                <p className="text-2xl font-bold">{money(agio.price)}</p>
                {canSeeCommission && <p className="text-sm font-semibold text-primary">Comissao: {money(agio.commissionPrice ?? 0)}</p>}
                <div className="grid gap-2 rounded-md border border-[#D3AA53]/20 bg-[#111214]/50 p-3 text-sm">
                  <p>Parcela: <strong>{money(agio.installmentAmount)}</strong></p>
                  <p>Saldo devedor: <strong>{money(agio.outstandingBalance)}</strong></p>
                  <p>Pagas: <strong>{agio.paidInstallments} parcelas</strong></p>
                  <p>{agio.roomInfo} - {agio.areaM2} m2</p>
                  <p>{agio.plannedFurniture ? "Com moveis planejados" : "Sem moveis planejados"}</p>
                  <p>{agio.firstOwner ? "Primeiro dono" : "Nao e primeiro dono"}</p>
                  <p>{agio.hasDebtsOrProcurations ? `Possui debitos/procuracoes${agio.debtNotes ? `: ${agio.debtNotes}` : ""}` : "Sem debitos/procuracoes informados"}</p>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{agio.description}</p>
                {agio.mapUrl && (
                  <a href={agio.mapUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
                    Ver localizacao
                  </a>
                )}
                {isAdmin && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/admin/agios/${agio.id}/editar`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold transition hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                    <Button type="button" variant="outline" className="w-full gap-2 text-red-700 hover:text-red-800" onClick={() => removeAgio(agio.id)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
