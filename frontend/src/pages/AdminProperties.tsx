import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Edit, Trash2 } from "lucide-react";
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
    setMessage("");
    try {
      await api(`/properties/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage(status === "VENDIDO" ? "Imovel marcado como vendido." : "Status atualizado.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  }

  async function markAsSold(property: Property) {
    const confirmed = window.confirm(`Marcar "${property.title}" como vendido?`);
    if (!confirmed) return;
    await updateStatus(property.id, "VENDIDO");
  }

  async function removeProperty(id: string) {
    const confirmed = window.confirm("Deseja remover este imovel? Ele deixara de aparecer no catalogo publico.");
    if (!confirmed) return;
    setMessage("");
    try {
      await api(`/properties/${id}`, { method: "DELETE" });
      setMessage("Imovel removido.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao remover imovel");
    }
  }

  function canShowSoldButton(property: Property) {
    if (property.status === "VENDIDO") return false;
    if (property.units?.length > 0) return property.availableUnits.length === 0;
    return true;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <p className="mt-5 font-semibold text-primary">Area administrativa</p>
        <h1 className="text-3xl font-bold">Imoveis cadastrados</h1>
        {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
      </div>

      {properties.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Nenhum imovel cadastrado ainda.</p>
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
                    <p className="text-sm font-semibold text-primary">
                      {property.type} - Venda - {property.status}
                    </p>
                    <h2 className="text-lg font-bold">{property.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {cityLabels[property.city]}, {property.neighborhood}
                    </p>
                    <p className="mt-2 text-xl font-bold">{money(property.price)}</p>
                    {property.availableUnits?.length > 0 && (
                      <p className="mt-1 text-sm text-primary">{property.availableUnits.length} unidades disponiveis</p>
                    )}
                    {property.units?.length > 0 && property.availableUnits.length === 0 && property.status !== "VENDIDO" && (
                      <p className="mt-1 text-sm text-primary">Todas as unidades foram vendidas. Agora voce pode marcar o anuncio como vendido.</p>
                    )}
                    {property.status === "VENDIDO" && property.soldBy && (
                      <p className="mt-1 text-sm text-muted-foreground">Vendido por {property.soldBy.name}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {property.status === "VENDIDO" ? (
                      <span className="inline-flex h-10 items-center rounded-md border border-[#D3AA53]/40 px-4 text-sm font-semibold text-primary">Vendido</span>
                    ) : (
                      <Select className="max-w-48" value={property.status} onChange={(event) => updateStatus(property.id, event.target.value as PropertyStatus)}>
                        <option value="DISPONIVEL">Disponivel</option>
                        <option value="RESERVADO">Reservado</option>
                      </Select>
                    )}
                    {canShowSoldButton(property) && (
                      <Button className="gap-2" onClick={() => markAsSold(property)}>
                        <BadgeCheck className="h-4 w-4" />
                        Vendido
                      </Button>
                    )}
                    <Link
                      to={`/admin/imoveis/${property.id}/editar`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Link>
                    <Button variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={() => removeProperty(property.id)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
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
