import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";
import type { PropertyFormDraft } from "./PropertyForm";
import { cityLabels, money } from "../utils/labels";
import type { PropertyCity } from "../types";

export function PropertyAdPreview({ draft }: { draft: PropertyFormDraft }) {
  const image = draft.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
  const price = Number(draft.price || 0);
  const city = draft.city as PropertyCity;

  return (
    <div className="sticky top-6 overflow-hidden rounded-lg border border-[#D3AA53]/30 bg-[#17191c] shadow-lg shadow-black/20">
      <img src={image} alt="" className="h-56 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm font-semibold text-primary">{draft.type || "NOVO"} · {draft.purpose || "VENDA"}</p>
          <h3 className="mt-1 text-xl font-bold">{draft.title || "Título do imóvel"}</h3>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {cityLabels[city] ?? "Cidade"}, {draft.neighborhood || "bairro"}
          </p>
        </div>

        <p className="text-3xl font-bold">{price > 0 ? money(price) : "R$ 0,00"}</p>

        <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
          <PreviewItem icon={<Ruler className="h-4 w-4" />} value={draft.areaM2 || "0"} suffix="m²" />
          <PreviewItem icon={<BedDouble className="h-4 w-4" />} value={draft.bedrooms || "0"} />
          <PreviewItem icon={<Bath className="h-4 w-4" />} value={draft.bathrooms || "0"} />
          <PreviewItem icon={<Car className="h-4 w-4" />} value={draft.parkingSpaces || "0"} />
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {draft.description || "A descrição do anúncio aparecerá aqui enquanto você preenche o cadastro."}
        </p>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {draft.featured && <span className="rounded-md bg-muted px-2 py-1 text-primary">Destaque</span>}
          {draft.acceptsFinancing && <span className="rounded-md bg-muted px-2 py-1 text-primary">Aceita financiamento</span>}
          {parseUnits(draft.availableUnits).length > 0 && (
            <span className="rounded-md bg-muted px-2 py-1 text-primary">{parseUnits(draft.availableUnits).length} unidades disponíveis</span>
          )}
          <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{draft.status || "DISPONIVEL"}</span>
        </div>
      </div>
    </div>
  );
}

function parseUnits(value: string) {
  return value
    .split(",")
    .map((unit) => unit.trim())
    .filter(Boolean);
}

function PreviewItem({ icon, value, suffix }: { icon: React.ReactNode; value: string; suffix?: string }) {
  return (
    <div className="flex min-h-14 flex-col items-center justify-center rounded-md bg-muted">
      {icon}
      <span className="mt-1 font-semibold">{value}{suffix ? ` ${suffix}` : ""}</span>
    </div>
  );
}
