import { FormEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ImageUploader } from "./ImageUploader";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { cities } from "../utils/labels";

type Props = {
  onSubmit: (payload: any) => Promise<void>;
  submitLabel: string;
  showStatus?: boolean;
  imageFolder?: "properties" | "property-requests";
  initialValues?: Partial<PropertyFormDraft>;
  resetOnSubmit?: boolean;
  onDraftChange?: (draft: PropertyFormDraft) => void;
  brokerOptions?: { userId: string; name: string }[];
  allowFeatured?: boolean;
};

export type PropertyFormDraft = {
  title: string;
  description: string;
  type: string;
  purpose: string;
  status: string;
  price: string;
  city: string;
  neighborhood: string;
  address: string;
  mapUrl: string;
  areaM2: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  availableUnits: string;
  acceptsFinancing: boolean;
  featured: boolean;
  soldById: string;
  images: string[];
};

const initial: PropertyFormDraft = {
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
  images: [] as string[]
};

export function PropertyForm({ onSubmit, submitLabel, showStatus, imageFolder = "properties", initialValues, resetOnSubmit = true, onDraftChange, brokerOptions = [], allowFeatured = false }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialValues) {
      setForm((current) => ({ ...current, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    onDraftChange?.(form);
  }, [form, onDraftChange]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        areaM2: Number(form.areaM2),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        parkingSpaces: Number(form.parkingSpaces),
        availableUnits: parseUnits(form.availableUnits),
        featured: allowFeatured ? form.featured : false,
        images: form.images
      });
      if (resetOnSubmit) {
        setForm(initial);
      }
      setMessage("Salvo com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  function setValue(name: string, value: string | boolean | string[]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input placeholder="Título" value={form.title} onChange={(e) => setValue("title", e.target.value)} required />
      <Input placeholder="Preço" type="number" value={form.price} onChange={(e) => setValue("price", e.target.value)} required />
      <Select value={form.city} onChange={(e) => setValue("city", e.target.value)}>
        {cities.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input placeholder="Bairro" value={form.neighborhood} onChange={(e) => setValue("neighborhood", e.target.value)} required />
      <Input placeholder="Endereço" value={form.address} onChange={(e) => setValue("address", e.target.value)} required />
      <Input placeholder="URL do Google Maps (opcional)" value={form.mapUrl} onChange={(e) => setValue("mapUrl", e.target.value)} />
      <Input placeholder="Área em m²" type="number" value={form.areaM2} onChange={(e) => setValue("areaM2", e.target.value)} required />
      <Select value={form.type} onChange={(e) => setValue("type", e.target.value)}>
        <option value="NOVO">Novo</option>
        <option value="USADO">Usado</option>
        <option value="PLANTA">Na planta</option>
      </Select>
      <Select value={form.purpose} onChange={(e) => setValue("purpose", e.target.value)}>
        <option value="VENDA">Venda</option>
        <option value="ALUGUEL">Aluguel</option>
      </Select>
      {showStatus && (
        <Select value={form.status} onChange={(e) => setValue("status", e.target.value)}>
          <option value="DISPONIVEL">Disponível</option>
          <option value="RESERVADO">Reservado</option>
          <option value="VENDIDO">Vendido</option>
          <option value="ALUGADO">Alugado</option>
          <option value="INATIVO">Inativo</option>
        </Select>
      )}
      {showStatus && form.status === "VENDIDO" && (
        <Select value={form.soldById} onChange={(e) => setValue("soldById", e.target.value)}>
          <option value="">Corretor que vendeu</option>
          {brokerOptions.map((broker) => (
            <option key={broker.userId} value={broker.userId}>
              {broker.name}
            </option>
          ))}
        </Select>
      )}
      <div className="grid grid-cols-3 gap-3">
        <Input placeholder="Quartos" type="number" value={form.bedrooms} onChange={(e) => setValue("bedrooms", e.target.value)} />
        <Input placeholder="Banheiros" type="number" value={form.bathrooms} onChange={(e) => setValue("bathrooms", e.target.value)} />
        <Input placeholder="Vagas" type="number" value={form.parkingSpaces} onChange={(e) => setValue("parkingSpaces", e.target.value)} />
      </div>
      <Input
        className="md:col-span-2"
        placeholder="Unidades disponíveis, separadas por vírgula. Ex: 01, 02, 03, 101, 102, 103"
        value={form.availableUnits}
        onChange={(e) => setValue("availableUnits", e.target.value)}
      />
      <div className="flex items-center gap-5 rounded-md border border-input bg-[#17191c] px-3 text-[#ECECEC]">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.acceptsFinancing} onChange={(e) => setValue("acceptsFinancing", e.target.checked)} />
          Aceita financiamento
        </label>
        {allowFeatured && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setValue("featured", e.target.checked)} />
            Destaque
          </label>
        )}
      </div>
      <Textarea className="md:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setValue("description", e.target.value)} required />
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-semibold">Imagens do imóvel</p>
        <ImageUploader folder={imageFolder} value={form.images} onChange={(urls) => setValue("images", urls)} />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={loading}>{loading ? "Salvando..." : submitLabel}</Button>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    </form>
  );
}

function parseUnits(value: string) {
  return value
    .split(",")
    .map((unit) => unit.trim())
    .filter(Boolean);
}
