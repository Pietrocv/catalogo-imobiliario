import { useEffect, useState } from "react";
import { Building2, ClipboardList, Home, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PropertyAdPreview } from "../components/PropertyAdPreview";
import { PropertyForm, type PropertyFormDraft } from "../components/PropertyForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { BrokerInvite, Property, PropertyRequest } from "../types";
import { dateBR } from "../utils/labels";

const initialPreview: PropertyFormDraft = {
  title: "",
  description: "",
  type: "NOVO",
  purpose: "VENDA",
  status: "DISPONIVEL",
  price: "",
  city: "VALPARAISO",
  neighborhood: "",
  address: "",
  mapUrl: "",
  areaM2: "",
  bedrooms: "2",
  bathrooms: "1",
  parkingSpaces: "1",
  availableUnits: "",
  acceptsFinancing: true,
  featured: false,
  soldById: "",
  images: []
};

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [invite, setInvite] = useState<BrokerInvite | null>(null);
  const [preview, setPreview] = useState<PropertyFormDraft>(initialPreview);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [propertiesData, requestsData, brokersData] = await Promise.all([
      api<Property[]>("/properties"),
      api<PropertyRequest[]>("/property-requests"),
      api<any[]>("/real-estates/brokers")
    ]);
    setProperties(propertiesData);
    setRequests(requestsData);
    setBrokers(brokersData);
  }

  async function createProperty(payload: any) {
    await api("/properties", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
  }

  async function generateInvite() {
    setMessage("");
    try {
      const data = await api<BrokerInvite>("/broker-invites", {
        method: "POST",
        body: JSON.stringify({ expiresInDays: 7 })
      });
      setInvite(data);
      setMessage("Link de convite gerado.");
      if (data.inviteUrl && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(data.inviteUrl);
          setMessage("Link de convite gerado e copiado.");
        } catch {
          setMessage("Link de convite gerado.");
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao gerar convite");
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
        <MetricCard
          to="/admin/imoveis"
          icon={<Home className="h-5 w-5" />}
          label="Imóveis cadastrados"
          value={properties.length}
          helper="Clique para visualizar a lista de imóveis"
        />
        <MetricCard
          to="/admin/pedidos"
          icon={<ClipboardList className="h-5 w-5" />}
          label="Pedidos pendentes"
          value={requests.filter((request) => request.status === "PENDENTE").length}
          helper="Clique para revisar solicitações"
        />
        <MetricCard
          to="/admin/corretores"
          icon={<Users className="h-5 w-5" />}
          label="Corretores vinculados"
          value={brokers.length}
          helper="Clique para visualizar a lista de corretores"
        />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">Convite para corretor</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gere um link para o corretor se cadastrar já vinculado à sua imobiliária.</p>
            {invite?.inviteUrl && (
              <div className="mt-3 rounded-md bg-muted p-3">
                <p className="break-all text-sm font-semibold text-primary">{invite.inviteUrl}</p>
                <p className="mt-1 text-xs text-muted-foreground">Expira em {dateBR(invite.expiresAt)}</p>
              </div>
            )}
          </div>
          <Button onClick={generateInvite}>Gerar link de convite</Button>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardContent>
            <div className="mb-5 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Cadastrar imóvel diretamente</h2>
            </div>
            <PropertyForm submitLabel="Cadastrar imóvel" showStatus allowFeatured brokerOptions={brokers} onDraftChange={setPreview} onSubmit={createProperty} />
          </CardContent>
        </Card>

        <div>
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Prévia do anúncio</p>
          <PropertyAdPreview draft={preview} />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ to, icon, label, value, helper }: { to: string; icon: React.ReactNode; label: string; value: number; helper: string }) {
  return (
    <Link to={to}>
      <Card className="h-full transition hover:border-primary hover:shadow-md">
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <span className="text-primary">{icon}</span>
          </div>
          <p className="mt-3 text-3xl font-bold">{value}</p>
          <p className="mt-2 text-sm text-primary">{helper}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
