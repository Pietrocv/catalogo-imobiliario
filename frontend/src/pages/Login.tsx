import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { dashboardPath } from "../utils/navigation";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@imperio.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(dashboardPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
      <Card className="w-full">
        <CardContent>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta para gerenciar imóveis, pedidos ou favoritos.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full">Acessar</Button>
          </form>

          <div className="mt-6 rounded-md border border-[#D3AA53]/25 bg-[#111214] p-4">
            <p className="text-sm font-semibold">Ainda não tem conta?</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie uma conta de cliente para salvar imóveis favoritos e acompanhar depois.</p>
            <Link
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-[#111214]"
              to="/register"
            >
              <UserPlus className="h-4 w-4" />
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
