import { ChangeEvent, DragEvent, useState } from "react";
import { GripVertical, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { uploadImage } from "../services/uploads";

type Props = {
  folder: "properties" | "property-requests" | "brokers";
  value: string[];
  onChange: (urls: string[]) => void;
  inviteToken?: string;
  multiple?: boolean;
};

export function ImageUploader({ folder, value, onChange, inviteToken, multiple = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file, folder, inviteToken)));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((item) => item !== url));
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...value];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    const fromIndex = draggedIndex ?? Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(fromIndex)) {
      moveImage(fromIndex, index);
    }
    setDraggedIndex(null);
  }

  return (
    <div className="space-y-3">
      <label className="inline-flex">
        <input className="sr-only" type="file" accept="image/*" multiple={multiple} onChange={handleFiles} disabled={uploading} />
        <span className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-[#17191c] px-4 text-sm font-semibold text-[#ECECEC] transition hover:bg-muted">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Enviando..." : multiple ? "Enviar imagens" : "Enviar imagem"}
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {value.length > 0 && (
        <div className="space-y-2">
          {multiple && <p className="text-xs text-muted-foreground">Arraste as imagens para reorganizar. A primeira imagem será a capa do anúncio.</p>}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              draggable={multiple && value.length > 1}
              onDragStart={(event) => handleDragStart(event, index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={`group relative overflow-hidden rounded-md border ${
                index === 0 ? "border-primary" : "border-border"
              } ${draggedIndex === index ? "opacity-60" : ""}`}
            >
              <img src={url} alt="" className="h-24 w-full object-cover" />
              {multiple && value.length > 1 && (
                <span className="absolute left-1 top-1 inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md bg-[#111214]/90 text-[#ECECEC]">
                  <GripVertical className="h-4 w-4" />
                </span>
              )}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-md bg-primary px-2 py-1 text-xs font-bold text-[#111214]">
                  Capa
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8 bg-[#111214]/90 p-0"
                onClick={() => remove(url)}
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
