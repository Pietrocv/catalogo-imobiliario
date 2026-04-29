import { LogOut, UserRound } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import imperioLogo from "../assets/imperiologo.jpg";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-bold">
            <img src={imperioLogo} alt="Império Imóveis" className="h-11 w-11 rounded-full object-cover" />
            <span>Império Imóveis</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/">Imóveis</Link>
            {user?.role === "ADMIN_IMOBILIARIA" && <Link to="/admin">Admin</Link>}
            {user?.role === "CORRETOR" && <Link to="/broker">Corretor</Link>}
            {user ? (
              <Button variant="ghost" onClick={logout} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
                <UserRound className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
