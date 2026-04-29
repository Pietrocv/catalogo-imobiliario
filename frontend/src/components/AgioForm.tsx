import { FormEvent, useEffect, useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { cities } from "../utils/labels";

type AgioDraft = {
  title: string;
  description: string;
  status: string;
  price: string;
  commissionPrice: string;
  installmentAmount: string;
  outstandingBalance: string;
  roomInfo: string;
  areaM2: string;
  plannedFurniture: boolean;
  hasDebtsOrProcurations: boolean;
  debtNotes: string;
  firstOwner: boolean;
  paidInstallments: string;
  city: string;
  neighborhood: string;
  address: string;
  mapUrl: string;
  condominiumName: string;
  brokerId: string;
  images: string[];
};

type Props = {
  onSubmit: (payload: any) => Promise<void>;
  brokers?: { userId: string; name: string }[];
  initialValues?: Partial<AgioDraft>;
  submitLabel?: string;
  resetOnSubmit?: boolean;
};

const initial: AgioDraft = {
  title: "",
  description: "",
  status: "DISPONIVEL",
  price: "",
  commissionPrice: "",
  installmentAmount: "",
  outstandingBalance: "",
  roomInfo: "",
  areaM2: "",
  plannedFurniture: false,
  hasDebtsOrProcurations: false,
  debtNotes: "",
  firstOwner: true,
  paidInstallments: "",
  city: "VALPARAISO",
  neighborhood: "",
  address: "",
  mapUrl: "",
  condominiumName: "",
  brokerId: "",
  images: []
};

export function AgioForm({ onSubmit, brokers = [], initialValues, submitLabel = "Cadastrar agio", resetOnSubmit = true }: Props) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialValues) {
      setForm((current) => ({ ...current, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (!form.hasDebtsOrProcurations && form.debtNotes) {
      setForm((current) => ({ ...current, debtNotes: "" }));
    }
  }, [form.hasDebtsOrProcurations, form.debtNotes]);

  function setValue(name: string, value: string | boolean | string[]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        commissionPrice: Number(form.commissionPrice || 0),
        installmentAmount: Number(form.installmentAmount),
        outstandingBalance: Number(form.outstandingBalance),
        areaM2: Number(form.areaM2),
        paidInstallments: Number(form.paidInstallments),
        brokerId: form.brokerId || undefined
      });
      if (resetOnSubmit) setForm(initial);
      setMessage("Agio salvo com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao cadastrar agio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input placeholder="Titulo do agio" value={form.title} onChange={(event) => setValue("title", event.target.value)} required />
      <Input placeholder="Nome do condominio" value={form.condominiumName} onChange={(event) => setValue("condominiumName", event.target.value)} required />
      <Input placeholder="Valor do agio" type="number" value={form.price} onChange={(event) => setValue("price", event.target.value)} required />
      <Input placeholder="Comissao" type="number" value={form.commissionPrice} onChange={(event) => setValue("commissionPrice", event.target.value)} />
      <Input placeholder="Valor da parcela" type="number" value={form.installmentAmount} onChange={(event) => setValue("installmentAmount", event.target.value)} required />
      <Input placeholder="Saldo devedor" type="number" value={form.outstandingBalance} onChange={(event) => setValue("outstandingBalance", event.target.value)} required />
      <Input placeholder="Comodos do imovel" value={form.roomInfo} onChange={(event) => setValue("roomInfo", event.target.value)} required />
      <Input placeholder="Metragem" type="number" value={form.areaM2} onChange={(event) => setValue("areaM2", event.target.value)} required />
      <Input placeholder="Parcelas pagas" type="number" value={form.paidInstallments} onChange={(event) => setValue("paidInstallments", event.target.value)} required />
      <Select value={form.city} onChange={(event) => setValue("city", event.target.value)}>
        {cities.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input placeholder="Setor/Bairro" value={form.neighborhood} onChange={(event) => setValue("neighborhood", event.target.value)} required />
      <Input placeholder="Endereco" value={form.address} onChange={(event) => setValue("address", event.target.value)} required />
      <Input placeholder="URL do Google Maps" value={form.mapUrl} onChange={(event) => setValue("mapUrl", event.target.value)} />
      <Select value={form.brokerId} onChange={(event) => setValue("brokerId", event.target.value)}>
        <option value="">Corretor captador</option>
        {brokers.map((broker) => (
          <option key={broker.userId} value={broker.userId}>
            {broker.name}
          </option>
        ))}
      </Select>
      <div className="md:col-span-2 flex flex-wrap gap-5 rounded-md border border-input bg-[#17191c] px-3 py-3 text-[#ECECEC]">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.plannedFurniture} onChange={(event) => setValue("plannedFurniture", event.target.checked)} />
          Tem moveis planejados
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.hasDebtsOrProcurations} onChange={(event) => setValue("hasDebtsOrProcurations", event.target.checked)} />
          Possui debitos ou procuracoes
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.firstOwner} onChange={(event) => setValue("firstOwner", event.target.checked)} />
          Primeiro dono
        </label>
      </div>
      {form.hasDebtsOrProcurations && (
        <Textarea className="md:col-span-2" placeholder="Detalhes dos debitos ou procuracoes" value={form.debtNotes} onChange={(event) => setValue("debtNotes", event.target.value)} />
      )}
      <Textarea className="md:col-span-2" placeholder="Descricao" value={form.description} onChange={(event) => setValue("description", event.target.value)} required />
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-semibold">Fotos do imovel e do condominio</p>
        <ImageUploader folder="agios" value={form.images} onChange={(urls) => setValue("images", urls)} />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={loading}>{loading ? "Salvando..." : submitLabel}</Button>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    </form>
  );
}
