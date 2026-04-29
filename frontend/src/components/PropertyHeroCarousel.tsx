import { useEffect, useMemo, useState } from "react";
import type { Property } from "../types";
import { cityLabels, money } from "../utils/labels";

const fallback = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

export function PropertyHeroCarousel({ properties }: { properties: Property[] }) {
  const slides = useMemo(() => {
    const withImages = properties.flatMap((property) =>
      property.images.map((image) => ({
        id: property.id,
        title: property.title,
        subtitle: `${cityLabels[property.city]}, ${property.neighborhood}`,
        price: money(property.price),
        image: image.url
      }))
    ).slice(0, 12);

    return withImages.length
      ? withImages
      : [
          {
            id: "fallback",
            title: "Imóveis selecionados",
            subtitle: "Valparaíso, Luziânia, Cidade Ocidental e Jardim Ingá",
            price: "Confira o catálogo",
            image: fallback
          }
        ];
  }, [properties]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <div className="relative h-72 overflow-hidden rounded-lg bg-muted">
      {slides.map((item, index) => (
        <img
          key={item.id}
          src={item.image}
          alt={item.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="text-sm font-semibold">{slide.price}</p>
        <h2 className="mt-1 line-clamp-1 text-xl font-bold">{slide.title}</h2>
        <p className="mt-1 line-clamp-1 text-sm text-white/85">{slide.subtitle}</p>
        <div className="mt-4 flex gap-2">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver imóvel ${index + 1}`}
              className={`h-2 rounded-full transition-all ${index === current ? "w-8 bg-white" : "w-2 bg-white/50"}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
