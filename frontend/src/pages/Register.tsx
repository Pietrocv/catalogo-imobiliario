import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { RealEstate, UserRole } from "../types";
import { dashboardPath } from "../utils/navigation";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENTE" as UserRole,
    realEstateId: "",
    phone: "",
    creci: "",
    avatarUrl: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api<RealEstate[]>("/real-estates").then(setRealEstates);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const user = await register({
        ...form,
        realEstateId: form.role === "CLIENTE" ? undefined : form.realEstateId || undefined,
        creci: form.creci || undefined,
        avatarUrl: form.avatarUrl || undefined
      });
      navigate(dashboardPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4">
      <Card className="w-full">
        <CardContent>
          <h1 className="text-2xl font-bold">Cadastro</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Input placeholder="E-mail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <Input placeholder="Senha" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
              <option value="CLIENTE">Cliente</option>
              <option value="CORRETOR">Corretor</option>
              <option value="ADMIN_IMOBILIARIA">Admin imobiliaria</option>
            </Select>
            {form.role !== "CLIENTE" && (
              <Select value={form.realEstateId} onChange={(event) => setForm({ ...form, realEstateId: event.target.value })}>
                <option value="">Selecione a imobiliaria</option>
                {realEstates.map((realEstate) => (
                  <option key={realEstate.id} value={realEstate.id}>
                    {realEstate.name}
                  </option>
                ))}
              </Select>
            )}
            {form.role === "CORRETOR" && (
              <>
                <Input placeholder="Telefone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
                <Input placeholder="CRECI (opcional)" value={form.creci} onChange={(event) => setForm({ ...form, creci: event.target.value })} />
                <Input placeholder="URL do avatar (opcional)" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} />
              </>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full">Cadastrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
