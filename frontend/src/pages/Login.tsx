import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";

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
      navigate(user.role === "ADMIN_IMOBILIARIA" ? "/admin" : "/broker");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
      <Card className="w-full">
        <CardContent>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full">Acessar</Button>
          </form>
          <Link className="mt-4 block text-sm text-primary" to="/register">Criar usuário</Link>
        </CardContent>
      </Card>
    </div>
  );
}
