import { ChangeEvent, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
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

  return (
    <div className="space-y-3">
      <label className="inline-flex">
        <input className="sr-only" type="file" accept="image/*" multiple={multiple} onChange={handleFiles} disabled={uploading} />
        <span className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold transition hover:bg-muted">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Enviando..." : multiple ? "Enviar imagens" : "Enviar imagem"}
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-md border border-border">
              <img src={url} alt="" className="h-24 w-full object-cover" />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8 bg-white/90 p-0"
                onClick={() => remove(url)}
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
