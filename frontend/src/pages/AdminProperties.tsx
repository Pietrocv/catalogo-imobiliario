import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { api } from "../services/api";
import type { Property, PropertyStatus } from "../types";
import { cityLabels, money } from "../utils/labels";

export function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setProperties(await api<Property[]>("/properties"));
  }

  async function updateStatus(id: string, status: PropertyStatus) {
    await api(`/properties/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await refresh();
  }

  async function inactivateProperty(id: string) {
    const confirmed = window.confirm("Deseja inativar este imóvel? Ele deixará de aparecer no catálogo público.");
    if (!confirmed) return;
    setMessage("");
    try {
      await api(`/properties/${id}`, { method: "DELETE" });
      setMessage("Imóvel inativado.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao inativar imóvel");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <p className="mt-5 font-semibold text-primary">Área administrativa</p>
        <h1 className="text-3xl font-bold">Imóveis cadastrados</h1>
        {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
      </div>

      {properties.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Nenhum imóvel cadastrado ainda.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => {
          const image = property.images[0]?.url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
          return (
            <Card key={property.id} className="overflow-hidden">
              <div className="grid md:grid-cols-[180px_1fr]">
                <img src={image} alt={property.title} className="h-full min-h-48 w-full object-cover" />
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">{property.type} · {property.purpose} · {property.status}</p>
                    <h2 className="text-lg font-bold">{property.title}</h2>
                    <p className="text-sm text-muted-foreground">{cityLabels[property.city]}, {property.neighborhood}</p>
                    <p className="mt-2 text-xl font-bold">{money(property.price)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Select className="max-w-48" value={property.status} onChange={(event) => updateStatus(property.id, event.target.value as PropertyStatus)}>
                      <option value="DISPONIVEL">Disponível</option>
                      <option value="RESERVADO">Reservado</option>
                      <option value="VENDIDO">Vendido</option>
                      <option value="ALUGADO">Alugado</option>
                    </Select>
                    <Link
                      to={`/admin/imoveis/${property.id}/editar`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                    <Button variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={() => inactivateProperty(property.id)}>
                      <Trash2 className="h-4 w-4" />
                      Inativar
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
