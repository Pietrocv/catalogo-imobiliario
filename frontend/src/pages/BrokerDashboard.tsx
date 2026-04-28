import { useEffect, useState } from "react";
import { PropertyForm } from "../components/PropertyForm";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { Property, PropertyRequest } from "../types";
import { cityLabels, money } from "../utils/labels";

export function BrokerDashboard() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [requestsData, propertiesData] = await Promise.all([
      api<PropertyRequest[]>("/property-requests"),
      api<Property[]>("/properties")
    ]);
    setRequests(requestsData);
    setProperties(propertiesData);
  }

  async function createRequest(payload: any) {
    await api("/property-requests", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <p className="font-semibold text-primary">Área do corretor</p>
        <h1 className="text-3xl font-bold">Pedidos e imóveis aprovados</h1>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-xl font-bold">Enviar pedido de cadastro</h2>
          <PropertyForm submitLabel="Enviar pedido" onSubmit={createRequest} />
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Meus pedidos</h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-md border border-border p-4">
                  <p className="font-semibold">{request.title}</p>
                  <p className="text-sm text-muted-foreground">{request.status} · {cityLabels[request.city]} · {money(request.price)}</p>
                  {request.rejectionReason && <p className="mt-1 text-sm text-red-600">{request.rejectionReason}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Imóveis aprovados da imobiliária</h2>
            <div className="space-y-3">
              {properties.map((property) => (
                <div key={property.id} className="rounded-md border border-border p-4">
                  <p className="font-semibold">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{cityLabels[property.city]} · {money(property.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
