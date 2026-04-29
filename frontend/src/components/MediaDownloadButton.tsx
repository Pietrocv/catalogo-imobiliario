import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Property } from "../types";
import { Button } from "./ui/button";

type Props = {
  property: Pick<Property, "title" | "images">;
  className?: string;
};

export function MediaDownloadButton({ property, className }: Props) {
  const [loading, setLoading] = useState(false);
  const images = property.images ?? [];

  async function downloadImages() {
    if (!images.length) return;
    setLoading(true);

    try {
      for (const [index, image] of images.entries()) {
        await downloadImage(image.url, `${slugify(property.title)}-${String(index + 1).padStart(2, "0")}.jpg`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" className={`gap-2 ${className ?? ""}`} onClick={downloadImages} disabled={loading || images.length === 0}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? "Baixando..." : "Baixar mídias"}
    </Button>
  );
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Falha ao baixar imagem");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filename);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "imovel";
}
