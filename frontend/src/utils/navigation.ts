import type { UserRole } from "../types";

export function dashboardPath(role: UserRole) {
  if (role === "ADMIN_IMOBILIARIA") return "/admin";
  if (role === "CORRETOR") return "/broker";
  return "/cliente/favoritos";
}

export function roleLabel(role: UserRole) {
  if (role === "ADMIN_IMOBILIARIA") return "Admin";
  if (role === "CORRETOR") return "Corretor";
  return "Cliente";
}
