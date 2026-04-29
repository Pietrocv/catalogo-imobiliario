import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { Button } from "./ui/button";

type Props = {
  propertyId: string;
  initialFavorited?: boolean;
  onChanged?: (favorited: boolean) => void;
  className?: string;
};

export function FavoriteButton({ propertyId, initialFavorited = false, onChanged, className }: Props) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  if (!user) {
    return (
      <Link
        to="/login"
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-semibold transition hover:bg-muted ${className ?? ""}`}
      >
        <Heart className="h-4 w-4" />
        Favoritar
      </Link>
    );
  }

  if (user.role !== "CLIENTE") return null;

  async function toggleFavorite() {
    setLoading(true);
    try {
      if (favorited) {
        await api(`/favorites/${propertyId}`, { method: "DELETE" });
        setFavorited(false);
        onChanged?.(false);
      } else {
        await api(`/favorites/${propertyId}`, { method: "POST" });
        setFavorited(true);
        onChanged?.(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" className={`gap-2 ${className ?? ""}`} onClick={toggleFavorite} disabled={loading}>
      <Heart className={`h-4 w-4 ${favorited ? "fill-primary text-primary" : ""}`} />
      {favorited ? "Favorito" : "Favoritar"}
    </Button>
  );
}
