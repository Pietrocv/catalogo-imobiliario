import { useEffect, useState } from "react";
import { PropertyForm } from "../components/PropertyForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { api } from "../services/api";
import type { Property, PropertyRequest, PropertyStatus } from "../types";
import { cityLabels, money } from "../utils/labels";

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [propertiesData, requestsData, brokersData] = await Promise.all([
      api<Property[]>("/properties"),
      api<PropertyRequest[]>("/property-requests"),
      api<any[]>("/brokers")
    ]);
    setProperties(propertiesData);
    setRequests(requestsData);
    setBrokers(brokersData);
  }

  async function createProperty(payload: any) {
    await api("/properties", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
  }

  async function updateStatus(id: string, status: PropertyStatus) {
    await api(`/properties/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await refresh();
  }

  async function approve(id: string) {
    setMessage("");
    try {
      await api(`/property-requests/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
      setMessage("Pedido aprovado e imóvel publicado no catálogo.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao aprovar pedido");
    }
  }

  async function reject(id: string) {
    const reason = window.prompt("Motivo da recusa");
    if (!reason) return;
    setMessage("");
    try {
      await api(`/property-requests/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
      setMessage("Pedido recusado.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao recusar pedido");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <p className="font-semibold text-primary">Área administrativa</p>
        <h1 className="text-3xl font-bold">Dashboard da imobiliária</h1>
        {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Imóveis" value={properties.length} />
        <Metric label="Pedidos pendentes" value={requests.filter((request) => request.status === "PENDENTE").length} />
        <Metric label="Corretores" value={brokers.length} />
      </section>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-xl font-bold">Cadastrar imóvel diretamente</h2>
          <PropertyForm submitLabel="Cadastrar imóvel" showStatus onSubmit={createProperty} />
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Pedidos de cadastro</h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-md border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{request.status} · {cityLabels[request.city]} · {money(request.price)}</p>
                      {request.rejectionReason && <p className="mt-1 text-sm text-red-600">{request.rejectionReason}</p>}
                    </div>
                    {request.status === "PENDENTE" && (
                      <div className="flex gap-2">
                        <Button onClick={() => approve(request.id)}>Aprovar</Button>
                        <Button variant="outline" onClick={() => reject(request.id)}>Recusar</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Imóveis administrativos</h2>
            <div className="space-y-3">
              {properties.map((property) => (
                <div key={property.id} className="rounded-md border border-border p-4">
                  <p className="font-semibold">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{cityLabels[property.city]} · {money(property.price)}</p>
                  <Select className="mt-3 max-w-48" value={property.status} onChange={(e) => updateStatus(property.id, e.target.value as PropertyStatus)}>
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="VENDIDO">Vendido</option>
                    <option value="ALUGADO">Alugado</option>
                    <option value="INATIVO">Inativo</option>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card><CardContent><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold">{value}</p></CardContent></Card>;
}
