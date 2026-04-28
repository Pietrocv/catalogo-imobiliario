import { useEffect, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { PropertyRequest } from "../types";
import { cityLabels, money } from "../utils/labels";

export function AdminRequests() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const data = await api<PropertyRequest[]>("/property-requests");
    setRequests(data);
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <p className="mt-5 font-semibold text-primary">Área administrativa</p>
        <h1 className="text-3xl font-bold">Pedidos de cadastro</h1>
        {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Nenhum pedido de cadastro enviado ainda.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {requests.map((request) => {
          const image = request.images[0]?.url ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
          return (
            <Card key={request.id} className="overflow-hidden">
              <div className="grid md:grid-cols-[180px_1fr]">
                <img src={image} alt={request.title} className="h-full min-h-48 w-full object-cover" />
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">{request.status} · {request.type} · {request.purpose}</p>
                    <h2 className="text-lg font-bold">{request.title}</h2>
                    <p className="text-sm text-muted-foreground">{cityLabels[request.city]}, {request.neighborhood}</p>
                    <p className="mt-2 text-xl font-bold">{money(request.price)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Enviado por {request.brokerProfile?.user?.name ?? "corretor"}</p>
                    {request.rejectionReason && <p className="mt-2 text-sm text-red-600">{request.rejectionReason}</p>}
                  </div>

                  {request.status === "PENDENTE" && (
                    <div className="flex flex-wrap gap-2">
                      <Button className="gap-2" onClick={() => approve(request.id)}>
                        <Check className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => reject(request.id)}>
                        <X className="h-4 w-4" />
                        Recusar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
