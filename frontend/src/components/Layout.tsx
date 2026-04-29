import type React from "react";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import imperioLogo from "../assets/imperiologo.jpg";
import { useAuth } from "../contexts/AuthContext";
import { dashboardPath, roleLabel } from "../utils/navigation";
import { Button } from "./ui/button";
import { WhatsAppContact } from "./WhatsAppContact";

export function Layout() {
  const { user, logout } = useAuth();
  const avatarUrl = user?.brokerProfile?.avatarUrl || null;
  const dashboardLink = user ? dashboardPath(user.role) : null;
  const dashboardLabel = user?.role === "CLIENTE" ? "Meus favoritos" : user?.role === "ADMIN_IMOBILIARIA" ? "Dashboard" : "Minha area";

  return (
    <div className="min-h-screen bg-[#111214] text-[#ECECEC]">
      <header className="sticky top-0 z-40 border-b border-[#D3AA53]/25 bg-[#111214]/95 shadow-lg shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={imperioLogo} alt="Império Imóveis" className="h-12 w-12 rounded-full border border-[#D3AA53]/70 object-cover" />
            <div>
              <p className="text-lg font-bold leading-tight text-[#ECECEC]">Império Imóveis</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#D3AA53]">Catálogo imobiliário</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#ECECEC]">
            <MenuLink to="/">Imóveis</MenuLink>
            {dashboardLink && (
              <MenuLink to={dashboardLink}>
                <LayoutDashboard className="h-4 w-4" />
                {dashboardLabel}
              </MenuLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardLink ?? "/"}
                  className="flex items-center gap-3 rounded-full border border-[#D3AA53]/30 bg-white/5 px-3 py-2 transition hover:border-[#D3AA53] hover:bg-[#D3AA53]/10"
                  title="Ir para minha área"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D3AA53] text-sm font-bold text-[#111214]">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="max-w-36 truncate text-sm font-bold text-[#ECECEC]">{user.name}</p>
                    <p className="text-xs text-[#D3AA53]">{roleLabel(user.role)}</p>
                  </div>
                </Link>
                <Button variant="ghost" className="text-[#ECECEC] hover:bg-[#D3AA53]/10 hover:text-[#D3AA53]" onClick={logout} title="Sair">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/login" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#D3AA53] px-4 text-sm font-bold text-[#111214] transition hover:bg-[#B7873A]">
                <UserRound className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <WhatsAppContact />
    </div>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex h-10 items-center gap-2 rounded-md px-3 transition ${
          isActive ? "bg-[#D3AA53] text-[#111214]" : "text-[#ECECEC] hover:bg-[#D3AA53]/10 hover:text-[#D3AA53]"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
