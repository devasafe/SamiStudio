"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/login", { method: "POST", json: { email, password } });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no login.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-surface flex min-h-svh items-center justify-center p-6">
      <div className="border-border bg-background w-full max-w-sm rounded-lg border p-8">
        <h1 className="font-heading text-xl tracking-tight">
          Sami da Silva <span className="text-muted-foreground">Studio</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Acesso ao painel</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              required
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11"
            />
          </div>
          {error ? <p className="text-error text-sm">{error}</p> : null}
          <Button type="submit" disabled={busy} className="h-11 w-full">
            {busy ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
