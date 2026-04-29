import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PropertyForm } from "../components/PropertyForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { api } from "../services/api";
import type { LinkedBroker, Property, PropertyUnit } from "../types";
import { dateBR } from "../utils/labels";

export function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [brokers, setBrokers] = useState<LinkedBroker[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Property>(`/properties/${id}`).then(setProperty);
    api<LinkedBroker[]>("/real-estates/brokers").then(setBrokers);
  }, [id]);

  const initialValues = useMemo(() => {
    if (!property) return undefined;
    return {
      title: property.title,
      description: property.description,
      type: property.type,
      purpose: property.purpose,
      status: property.status,
      price: String(property.price),
      city: property.city,
      neighborhood: property.neighborhood,
      address: property.address,
      mapUrl: property.mapUrl ?? "",
      areaM2: String(property.areaM2),
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      parkingSpaces: String(property.parkingSpaces),
      availableUnits: property.units?.length ? property.units.map((unit) => unit.label).join(", ") : property.availableUnits?.join(", ") ?? "",
      acceptsFinancing: property.acceptsFinancing,
      featured: property.featured,
      soldById: property.soldById ?? property.soldBy?.id ?? "",
      images: property.images.map((image) => image.url)
    };
  }, [property]);

  async function updateProperty(payload: any) {
    const updated = await api<Property>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setProperty(updated);
    setMessage("Imóvel atualizado com sucesso.");
  }

  async function removeProperty() {
    const confirmed = window.confirm("Deseja remover este imóvel? Ele deixará de aparecer no catálogo público.");
    if (!confirmed) return;
    await api(`/properties/${id}`, { method: "DELETE" });
    navigate("/");
  }

  async function sellUnit(unitId: string, soldById: string) {
    if (!soldById) {
      setMessage("Selecione quem vendeu a unidade.");
      return;
    }
    const updated = await api<Property>(`/properties/${id}/units/${unitId}/sell`, {
      method: "PATCH",
      body: JSON.stringify({ soldById })
    });
    setProperty(updated);
    setMessage("Unidade marcada como vendida.");
  }

  if (!property) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Carregando imóvel...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </Link>
          <p className="mt-5 font-semibold text-primary">Área administrativa</p>
          <h1 className="text-3xl font-bold">Editar imóvel</h1>
          {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
        </div>
        <Button variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={removeProperty}>
          <Trash2 className="h-4 w-4" />
          Remover imóvel
        </Button>
      </div>

      <Card>
        <CardContent>
          <PropertyForm
            submitLabel="Salvar alterações"
            showStatus
            allowFeatured
            brokerOptions={brokers}
            initialValues={initialValues}
            resetOnSubmit={false}
            onSubmit={updateProperty}
          />
        </CardContent>
      </Card>

      {property.units?.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Unidades do anúncio</h2>
            <div className="grid gap-3">
              {property.units.map((unit) => (
                <UnitRow key={unit.id} unit={unit} brokers={brokers} onSell={(soldById) => sellUnit(unit.id, soldById)} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UnitRow({ unit, brokers, onSell }: { unit: PropertyUnit; brokers: LinkedBroker[]; onSell: (soldById: string) => void }) {
  const [soldById, setSoldById] = useState("");
  const sellerName = unit.soldBy?.name || unit.soldByExternalName;

  return (
    <div className="rounded-md border border-border bg-[#17191c] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Unidade</p>
          <p className="text-lg font-bold text-primary">{unit.label}</p>
          {unit.status === "VENDIDO" && (
            <p className="mt-1 text-sm text-muted-foreground">
              Vendida por {sellerName || "não informado"} {unit.soldAt ? `em ${dateBR(unit.soldAt)}` : ""}
            </p>
          )}
        </div>
        {unit.status === "DISPONIVEL" ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={soldById} onChange={(event) => setSoldById(event.target.value)}>
              <option value="">Quem vendeu?</option>
              <option value="EXTERNAL_PARTNER">Parceiro de fora</option>
              {brokers.map((broker) => (
                <option key={broker.userId} value={broker.userId}>
                  {broker.name}
                </option>
              ))}
            </Select>
            <Button type="button" onClick={() => onSell(soldById)}>
              Marcar como vendida
            </Button>
          </div>
        ) : (
          <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">Vendida</span>
        )}
      </div>
    </div>
  );
}
