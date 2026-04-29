import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AgioForm } from "../components/AgioForm";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../services/api";
import type { Agio, LinkedBroker } from "../types";

export function EditAgio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agio, setAgio] = useState<Agio | null>(null);
  const [brokers, setBrokers] = useState<LinkedBroker[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Agio>(`/agios/${id}`).then(setAgio);
    api<LinkedBroker[]>("/real-estates/brokers").then(setBrokers);
  }, [id]);

  const initialValues = useMemo(() => {
    if (!agio) return undefined;
    return {
      title: agio.title,
      description: agio.description,
      status: agio.status,
      price: String(agio.price),
      commissionPrice: String(agio.commissionPrice ?? 0),
      installmentAmount: String(agio.installmentAmount),
      outstandingBalance: String(agio.outstandingBalance),
      roomInfo: agio.roomInfo,
      areaM2: String(agio.areaM2),
      plannedFurniture: agio.plannedFurniture,
      hasDebtsOrProcurations: agio.hasDebtsOrProcurations,
      debtNotes: agio.debtNotes ?? "",
      firstOwner: agio.firstOwner,
      paidInstallments: String(agio.paidInstallments),
      city: agio.city,
      neighborhood: agio.neighborhood,
      address: agio.address,
      mapUrl: agio.mapUrl ?? "",
      condominiumName: agio.condominiumName,
      brokerId: agio.brokerId ?? agio.broker?.id ?? "",
      images: agio.images.map((image) => image.url)
    };
  }, [agio]);

  async function updateAgio(payload: any) {
    const updated = await api<Agio>(`/agios/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    setAgio(updated);
    setMessage("Agio atualizado com sucesso.");
  }

  async function removeAgio() {
    const confirmed = window.confirm("Deseja remover este agio?");
    if (!confirmed) return;
    await api(`/agios/${id}`, { method: "DELETE" });
    navigate("/agios");
  }

  if (!agio) return <div className="mx-auto max-w-7xl px-4 py-8">Carregando agio...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/agios" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar para agios
          </Link>
          <p className="mt-5 font-semibold text-primary">Area administrativa</p>
          <h1 className="text-3xl font-bold">Editar agio</h1>
          {message && <p className="mt-2 text-sm font-medium text-primary">{message}</p>}
        </div>
        <Button variant="outline" className="gap-2 text-red-700 hover:text-red-800" onClick={removeAgio}>
          <Trash2 className="h-4 w-4" />
          Remover agio
        </Button>
      </div>

      <Card>
        <CardContent>
          <AgioForm brokers={brokers} initialValues={initialValues} submitLabel="Salvar alteracoes" resetOnSubmit={false} onSubmit={updateAgio} />
        </CardContent>
      </Card>
    </div>
  );
}
