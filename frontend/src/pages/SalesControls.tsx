import { Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Property, SalesControl } from "../types";
import { dateBR } from "../utils/labels";

const initialForm = {
  clientCpf: "",
  propertyName: "",
  clientName: "",
  builder: "",
  saleDate: "",
  cca: "",
  signatureDate: "",
  dispatcherPaid: "false",
  paymentMethod: "",
  notes: ""
};

export function SalesControls() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SalesControl[]>([]);
  const [soldOptions, setSoldOptions] = useState<SoldPropertyOption[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "ADMIN_IMOBILIARIA";

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [salesRows, properties] = await Promise.all([
      api<SalesControl[]>("/sales-controls"),
      api<Property[]>("/properties")
    ]);
    setRows(salesRows);
    setSoldOptions(buildSoldOptions(properties));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    await api("/sales-controls", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        dispatcherPaid: form.dispatcherPaid === "true",
        signatureDate: form.signatureDate || null
      })
    });
    setForm(initialForm);
    setMessage("Venda adicionada na planilha.");
    await load();
  }

  async function remove(id: string) {
    const confirmed = window.confirm("Deseja remover esta linha da planilha?");
    if (!confirmed) return;
    await api(`/sales-controls/${id}`, { method: "DELETE" });
    await load();
  }

  function selectSoldProperty(value: string) {
    const option = soldOptions.find((item) => item.id === value);
    setForm({
      ...form,
      propertyName: option?.propertyName ?? "",
      saleDate: option?.saleDate ? toDateInput(option.saleDate) : ""
    });
  }

  function exportCsv() {
    const header = ["CPF do cliente", "Imovel", "Nome do cliente", "Construtora", "Data venda", "CCA", "Data assinatura", "DA/despachante paga", "Forma de pagamento", "Obs"];
    const body = rows.map((row) => [
      row.clientCpf,
      row.propertyName,
      row.clientName,
      row.builder ?? "",
      dateBR(row.saleDate),
      row.cca ?? "",
      row.signatureDate ? dateBR(row.signatureDate) : "",
      row.dispatcherPaid ? "Sim" : "Nao",
      row.paymentMethod ?? "",
      row.notes ?? ""
    ]);
    const csv = [header, ...body].map((line) => line.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "controle-vendas-imperio-imoveis.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-semibold text-primary">Planilhas</p>
          <h1 className="text-3xl font-bold">Controle de vendas</h1>
          <p className="mt-2 text-sm text-muted-foreground">Registre as vendas e exporte em CSV para abrir no Google Sheets.</p>
          {message && <p className="mt-2 text-sm font-semibold text-primary">{message}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <a href="https://sheets.new" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            Abrir Google Sheets
          </a>
        </div>
      </div>

      {isAdmin && (
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-bold">Adicionar venda</h2>
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Input placeholder="CPF do cliente" value={form.clientCpf} onChange={(event) => setForm({ ...form, clientCpf: event.target.value })} required />
              <Select value={soldOptions.find((option) => option.propertyName === form.propertyName && toDateInput(option.saleDate) === form.saleDate)?.id ?? ""} onChange={(event) => selectSoldProperty(event.target.value)} required>
                <option value="">Qual foi o imovel vendido?</option>
                {soldOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input placeholder="Nome do cliente" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} required />
              <Input placeholder="Construtora" value={form.builder} onChange={(event) => setForm({ ...form, builder: event.target.value })} />
              <Input type="date" value={form.saleDate} readOnly required />
              <Input placeholder="CCA" value={form.cca} onChange={(event) => setForm({ ...form, cca: event.target.value })} />
              <Input type="date" value={form.signatureDate} onChange={(event) => setForm({ ...form, signatureDate: event.target.value })} />
              <Select value={form.dispatcherPaid} onChange={(event) => setForm({ ...form, dispatcherPaid: event.target.value })}>
                <option value="false">DA/despachante nao paga</option>
                <option value="true">DA/despachante paga</option>
              </Select>
              <Input placeholder="Como foi o pagamento" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} />
              <Textarea className="lg:col-span-3" placeholder="Observacoes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              <div className="lg:col-span-3">
                <Button>Adicionar na planilha</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <Th>CPF</Th>
                  <Th>Imovel</Th>
                  <Th>Cliente</Th>
                  <Th>Construtora</Th>
                  <Th>Data venda</Th>
                  <Th>CCA</Th>
                  <Th>Data assinatura</Th>
                  <Th>DA paga</Th>
                  <Th>Pagamento</Th>
                  <Th>Obs</Th>
                  {isAdmin && <Th />}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={isAdmin ? 11 : 10}>
                      Nenhuma venda registrada ainda.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <Td>{row.clientCpf}</Td>
                    <Td>{row.propertyName}</Td>
                    <Td>{row.clientName}</Td>
                    <Td>{row.builder || "-"}</Td>
                    <Td>{dateBR(row.saleDate)}</Td>
                    <Td>{row.cca || "-"}</Td>
                    <Td>{row.signatureDate ? dateBR(row.signatureDate) : "-"}</Td>
                    <Td>{row.dispatcherPaid ? "Sim" : "Nao"}</Td>
                    <Td>{row.paymentMethod || "-"}</Td>
                    <Td>{row.notes || "-"}</Td>
                    {isAdmin && (
                      <Td>
                        <Button type="button" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => remove(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-3 align-top">{children}</td>;
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

type SoldPropertyOption = {
  id: string;
  label: string;
  propertyName: string;
  saleDate: string;
};

function buildSoldOptions(properties: Property[]): SoldPropertyOption[] {
  const options = properties.flatMap((property) => {
    const unitSales =
      property.units
        ?.filter((unit) => unit.status === "VENDIDO")
        .map((unit) => ({
          id: `unit:${unit.id}`,
          label: `${property.title} - Unidade ${unit.label} - ${dateBR(unit.soldAt ?? property.updatedAt)}`,
          propertyName: `${property.title} - Unidade ${unit.label}`,
          saleDate: unit.soldAt ?? property.updatedAt
        })) ?? [];

    const propertySale =
      property.status === "VENDIDO"
        ? [
            {
              id: `property:${property.id}`,
              label: `${property.title} - ${dateBR(property.soldAt ?? property.updatedAt)}`,
              propertyName: property.title,
              saleDate: property.soldAt ?? property.updatedAt
            }
          ]
        : [];

    return [...propertySale, ...unitSales];
  });

  return options.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
}

function toDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}
