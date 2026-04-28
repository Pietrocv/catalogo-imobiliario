import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { RealEstate, UserRole } from "../types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CORRETOR" as UserRole, realEstateId: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    api<RealEstate[]>("/real-estates").then(setRealEstates);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const user = await register({ ...form, realEstateId: form.realEstateId || undefined });
      navigate(user.role === "ADMIN_IMOBILIARIA" ? "/admin" : "/broker");
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
            <Input placeholder="Nome" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="E-mail" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Senha" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="CORRETOR">Corretor</option>
              <option value="ADMIN_IMOBILIARIA">Admin imobiliária</option>
            </Select>
            <Select value={form.realEstateId} onChange={(e) => setForm({ ...form, realEstateId: e.target.value })}>
              <option value="">Selecione a imobiliária</option>
              {realEstates.map((realEstate) => <option key={realEstate.id} value={realEstate.id}>{realEstate.name}</option>)}
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full">Cadastrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
