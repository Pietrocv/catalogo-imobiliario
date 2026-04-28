import type React from "react";
import { ArrowLeft, ClipboardList, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { LinkedBroker } from "../types";
import { dateBR } from "../utils/labels";

export function AdminBrokers() {
  const [brokers, setBrokers] = useState<LinkedBroker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<LinkedBroker[]>("/real-estates/brokers")
      .then(setBrokers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao dashboard
        </Link>
        <p className="mt-5 font-semibold text-primary">Área administrativa</p>
        <h1 className="text-3xl font-bold">Corretores vinculados</h1>
      </div>

      {loading && <p className="text-muted-foreground">Carregando corretores...</p>}

      {!loading && brokers.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Nenhum corretor vinculado ainda. Gere um convite para adicionar corretores à sua imobiliária.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {brokers.map((broker) => (
          <Card key={broker.id}>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {broker.avatarUrl ? (
                  <img src={broker.avatarUrl} alt={broker.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-primary">
                    {broker.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">{broker.name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{broker.email}</p>
                  <p className="text-sm text-muted-foreground">{broker.phone || "Telefone não informado"}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-semibold">{broker.creci || "CRECI não informado"}</p>
                <p className="text-muted-foreground">Vinculado em {dateBR(broker.linkedAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                <Counter icon={<Home className="h-4 w-4" />} label="Imóveis captados" value={broker.propertiesCount} />
                <Counter icon={<ClipboardList className="h-4 w-4" />} label="Pedidos enviados" value={broker.requestsCount} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Counter({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold">{value}</span></div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
