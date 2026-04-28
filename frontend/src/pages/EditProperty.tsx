import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PropertyForm } from "../components/PropertyForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { Property } from "../types";

export function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Property>(`/properties/${id}`).then(setProperty);
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
      areaM2: String(property.areaM2),
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      parkingSpaces: String(property.parkingSpaces),
      acceptsFinancing: property.acceptsFinancing,
      featured: property.featured,
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

  async function inactivateProperty() {
    const confirmed = window.confirm("Deseja inativar este imóvel? Ele deixará de aparecer no catálogo público.");
    if (!confirmed) return;
    await api(`/properties/${id}`, { method: "DELETE" });
    navigate("/");
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
        <Button variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={inactivateProperty}>
          <Trash2 className="h-4 w-4" />
          Inativar imóvel
        </Button>
      </div>

      <Card>
        <CardContent>
          <PropertyForm
            submitLabel="Salvar alterações"
            showStatus
            initialValues={initialValues}
            resetOnSubmit={false}
            onSubmit={updateProperty}
          />
        </CardContent>
      </Card>
    </div>
  );
}
