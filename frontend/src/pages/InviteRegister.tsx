import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageUploader } from "../components/ImageUploader";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { BrokerInvite, User } from "../types";
import { dateBR } from "../utils/labels";

export function InviteRegister() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [invite, setInvite] = useState<BrokerInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    creci: "",
    avatarUrl: ""
  });

  useEffect(() => {
    api<BrokerInvite>(`/broker-invites/${token}`)
      .then(setInvite)
      .catch((err) => setError(err instanceof Error ? err.message : "Convite inválido"))
      .finally(() => setLoading(false));
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await api<{ token: string; user: User }>(`/broker-invites/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          creci: form.creci || undefined,
          avatarUrl: form.avatarUrl || undefined
        })
      });
      setSession(data.token, data.user);
      navigate("/broker");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aceitar convite");
    }
  }

  if (loading) return <div className="mx-auto max-w-md px-4 py-10">Carregando convite...</div>;

  if (!invite) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
        <Card className="w-full">
          <CardContent>
            <h1 className="text-2xl font-bold">Convite indisponível</h1>
            <p className="mt-3 text-muted-foreground">{error || "Solicite um novo link para a imobiliária."}</p>
            <Link className="mt-5 inline-flex text-sm font-semibold text-primary" to="/">Voltar ao catálogo</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardContent>
          <p className="font-semibold text-primary">{invite.realEstate.name}</p>
          <h1 className="mt-2 text-2xl font-bold">Cadastro de corretor</h1>
          <p className="mt-2 text-sm text-muted-foreground">Convite válido até {dateBR(invite.expiresAt)}.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input placeholder="CRECI (opcional)" value={form.creci} onChange={(e) => setForm({ ...form, creci: e.target.value })} />
            <div>
              <p className="mb-2 text-sm font-semibold">Avatar (opcional)</p>
              <ImageUploader
                folder="brokers"
                multiple={false}
                inviteToken={token}
                value={form.avatarUrl ? [form.avatarUrl] : []}
                onChange={(urls) => setForm({ ...form, avatarUrl: urls[0] ?? "" })}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full">Aceitar convite e cadastrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
