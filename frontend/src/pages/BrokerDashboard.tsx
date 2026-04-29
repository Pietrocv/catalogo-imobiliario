import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Home, PlusCircle, TrendingUp, UserPen } from "lucide-react";
import { FormEvent } from "react";
import { ImageUploader } from "../components/ImageUploader";
import { MediaDownloadButton } from "../components/MediaDownloadButton";
import { PropertyForm } from "../components/PropertyForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Property, PropertyRequest } from "../types";
import { cityLabels, dateBR, money } from "../utils/labels";
import imperioLogo from "../assets/imperiologo.jpg";

type Tab = "overview" | "requests" | "properties" | "sold" | "new-request";

type SoldUnitRecord = {
  property: Property;
  unitLabel: string;
  soldAt?: string | null;
};

export function BrokerDashboard() {
  const { user, token, setSession } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    creci: "",
    avatarUrl: ""
  });

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name,
      phone: user.brokerProfile?.phone ?? "",
      creci: user.brokerProfile?.creci ?? "",
      avatarUrl: user.brokerProfile?.avatarUrl ?? ""
    });
  }, [user]);

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
    setActiveTab("requests");
  }

  async function updateProfile(event: FormEvent) {
    event.preventDefault();
    setProfileMessage("");
    const data = await api<{ user: NonNullable<typeof user> }>("/me", {
      method: "PATCH",
      body: JSON.stringify(profileForm)
    });
    if (token) setSession(token, data.user);
    setEditingProfile(false);
    setProfileMessage("Perfil atualizado com sucesso.");
  }

  const capturedProperties = useMemo(() => properties.filter((property) => property.broker?.id === user?.id), [properties, user?.id]);
  const soldProperties = useMemo(
    () => properties.filter((property) => property.status === "VENDIDO" && property.soldBy?.id === user?.id),
    [properties, user?.id]
  );
  const soldUnits = useMemo(
    () =>
      properties.flatMap((property) =>
        (property.units ?? [])
          .filter((unit) => unit.status === "VENDIDO" && unit.soldBy?.id === user?.id)
          .map((unit) => ({ property, unitLabel: unit.label, soldAt: unit.soldAt }))
      ),
    [properties, user?.id]
  );

  const yearlyStats = useMemo(() => buildYearlyStats(capturedProperties, soldProperties, soldUnits), [capturedProperties, soldProperties, soldUnits]);
  const profile = user?.brokerProfile;
  const avatar = profile?.avatarUrl || imperioLogo;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-semibold text-primary">Area do corretor</p>
          <h1 className="text-3xl font-bold">Minha area</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe seus dados, pedidos, imoveis captados e vendas registradas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Resumo</TabButton>
          <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Meus pedidos</TabButton>
          <TabButton active={activeTab === "properties"} onClick={() => setActiveTab("properties")}>Imoveis da imobiliaria</TabButton>
          <TabButton active={activeTab === "sold"} onClick={() => setActiveTab("sold")}>Vendas</TabButton>
          <TabButton active={activeTab === "new-request"} onClick={() => setActiveTab("new-request")}>Novo pedido</TabButton>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
            <Card>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                  <img src={avatar} alt={user?.name ?? "Corretor"} className="h-20 w-20 rounded-full border border-primary/30 object-cover" />
                  <div>
                    <p className="text-sm text-muted-foreground">Corretor vinculado</p>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" onClick={() => setEditingProfile((current) => !current)}>
                    <UserPen className="h-4 w-4" />
                    Alterar
                  </Button>
                </div>
                <div className="mt-5 grid gap-3 text-sm">
                  <InfoRow label="Telefone" value={profile?.phone || "Nao informado"} />
                  <InfoRow label="CRECI" value={profile?.creci || "CRECI nao informado"} />
                  <InfoRow label="Vinculo" value={profile?.linkedAt ? `Vinculado em ${dateBR(profile.linkedAt)}` : "Data nao informada"} />
                </div>
                {profileMessage && <p className="mt-4 text-sm font-semibold text-primary">{profileMessage}</p>}
                {editingProfile && (
                  <form onSubmit={updateProfile} className="mt-5 space-y-3 border-t border-border pt-5">
                    <Input placeholder="Nome" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required />
                    <Input placeholder="Telefone" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} required />
                    <Input placeholder="CRECI (opcional)" value={profileForm.creci} onChange={(event) => setProfileForm({ ...profileForm, creci: event.target.value })} />
                    <div>
                      <p className="mb-2 text-sm font-semibold">Foto do perfil</p>
                      <ImageUploader
                        folder="brokers"
                        value={profileForm.avatarUrl ? [profileForm.avatarUrl] : []}
                        multiple={false}
                        onChange={(urls) => setProfileForm({ ...profileForm, avatarUrl: urls[0] ?? "" })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Salvar perfil</Button>
                      <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <section className="grid gap-4 sm:grid-cols-3">
              <Metric icon={<Home className="h-5 w-5" />} label="Imoveis captados" value={capturedProperties.length} />
              <Metric icon={<TrendingUp className="h-5 w-5" />} label="Vendas registradas" value={soldProperties.length + soldUnits.length} />
              <Metric icon={<ClipboardList className="h-5 w-5" />} label="Pedidos enviados" value={requests.length} />
            </section>
          </section>

          <Card>
            <CardContent>
              <h2 className="mb-4 text-xl font-bold">Desempenho por ano</h2>
              {yearlyStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda nao ha imoveis captados ou vendas para montar o resumo anual.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {yearlyStats.map((stat) => (
                    <div key={stat.year} className="rounded-md border border-border bg-[#17191c] p-4">
                      <p className="text-sm text-muted-foreground">Ano</p>
                      <p className="text-2xl font-bold text-primary">{stat.year}</p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <InfoRow label="Captados" value={String(stat.captured)} />
                        <InfoRow label="Vendas" value={String(stat.sold)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "new-request" && (
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Enviar pedido de cadastro</h2>
            </div>
            <PropertyForm submitLabel="Enviar pedido" imageFolder="property-requests" allowFeatured={false} onSubmit={createRequest} />
          </CardContent>
        </Card>
      )}

      {activeTab === "requests" && (
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Meus pedidos</h2>
            <div className="space-y-3">
              {requests.length === 0 && <p className="text-sm text-muted-foreground">Voce ainda nao enviou pedidos de cadastro.</p>}
              {requests.map((request) => (
                <div key={request.id} className="rounded-md border border-border bg-[#17191c] p-4">
                  <p className="font-semibold">{request.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.status} - {cityLabels[request.city]} - {money(request.price)}
                  </p>
                  {request.rejectionReason && <p className="mt-1 text-sm text-red-400">{request.rejectionReason}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "properties" && (
        <PropertyList title="Lista dos imoveis da imobiliaria" properties={properties} empty="Nenhum imovel disponivel na imobiliaria ainda." />
      )}

      {activeTab === "sold" && <SoldList properties={soldProperties} units={soldUnits} />}
    </div>
  );
}

function buildYearlyStats(captured: Property[], sold: Property[], soldUnits: SoldUnitRecord[]) {
  const years = new Map<number, { year: number; captured: number; sold: number }>();
  captured.forEach((property) => {
    const year = new Date(property.createdAt).getFullYear();
    const stat = years.get(year) ?? { year, captured: 0, sold: 0 };
    stat.captured += 1;
    years.set(year, stat);
  });
  sold.forEach((property) => {
    const year = new Date(property.soldAt ?? property.updatedAt).getFullYear();
    const stat = years.get(year) ?? { year, captured: 0, sold: 0 };
    stat.sold += 1;
    years.set(year, stat);
  });
  soldUnits.forEach((record) => {
    const year = new Date(record.soldAt ?? record.property.updatedAt).getFullYear();
    const stat = years.get(year) ?? { year, captured: 0, sold: 0 };
    stat.sold += 1;
    years.set(year, stat);
  });
  return [...years.values()].sort((a, b) => b.year - a.year);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button type="button" variant={active ? "default" : "outline"} onClick={onClick}>
      {children}
    </Button>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="text-primary">{icon}</span>
        </div>
        <p className="mt-3 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function PropertyList({ title, properties, empty }: { title: string; properties: Property[]; empty: string }) {
  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        <div className="space-y-3">
          {properties.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
          {properties.map((property) => (
            <div key={property.id} className="rounded-md border border-border bg-[#17191c] p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{property.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {cityLabels[property.city]} - {property.neighborhood} - {money(property.price)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">Comissao: {money(property.commissionPrice ?? 0)}</p>
                  {property.availableUnits?.length > 0 && (
                    <p className="mt-1 text-sm text-primary">{property.availableUnits.length} unidades disponiveis</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <MediaDownloadButton property={property} />
                  <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">{property.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SoldList({ properties, units }: { properties: Property[]; units: SoldUnitRecord[] }) {
  const hasSales = properties.length > 0 || units.length > 0;
  return (
    <Card>
      <CardContent>
        <h2 className="mb-4 text-xl font-bold">Vendas</h2>
        <div className="space-y-3">
          {!hasSales && <p className="text-sm text-muted-foreground">Nenhuma venda foi vinculada ao seu usuario ainda.</p>}
          {properties.map((property) => (
            <div key={property.id} className="rounded-md border border-border bg-[#17191c] p-4">
              <p className="font-semibold">{property.title}</p>
              <p className="text-sm text-muted-foreground">
                {cityLabels[property.city]} - {property.neighborhood} - {money(property.price)}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">Comissao: {money(property.commissionPrice ?? 0)}</p>
              <p className="mt-1 text-sm text-primary">Imovel vendido em {property.soldAt ? dateBR(property.soldAt) : "data nao informada"}</p>
            </div>
          ))}
          {units.map((record) => (
            <div key={`${record.property.id}-${record.unitLabel}`} className="rounded-md border border-border bg-[#17191c] p-4">
              <p className="font-semibold">{record.property.title}</p>
              <p className="text-sm text-muted-foreground">
                Unidade {record.unitLabel} - {cityLabels[record.property.city]} - {record.property.neighborhood}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">Comissao do anuncio: {money(record.property.commissionPrice ?? 0)}</p>
              <p className="mt-1 text-sm text-primary">Unidade vendida em {record.soldAt ? dateBR(record.soldAt) : "data nao informada"}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
