import type { PropertyCity } from "../types";

export const cityLabels: Record<PropertyCity, string> = {
  VALPARAISO: "Valparaíso de Goiás",
  LUZIANIA: "Luziânia",
  CIDADE_OCIDENTAL: "Cidade Ocidental",
  JARDIM_INGA: "Jardim Ingá"
};

export const cities = Object.entries(cityLabels);

export function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function dateBR(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
