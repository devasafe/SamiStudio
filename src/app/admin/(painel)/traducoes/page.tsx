"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const locales = ["pt-BR", "en", "es"] as const;
type Locale = (typeof locales)[number];

interface TranslationDoc {
  locale: string;
  content: Record<string, unknown>;
}

/**
 * Editor de overrides de tradução por idioma (Docs/12).
 * O conteúdo sobrepõe os dicionários padrão do site.
 */
export default function AdminTranslationsPage() {
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [content, setContent] = useState("{}");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (target: Locale) => {
    try {
      const { data } = await api<TranslationDoc | null>(`/translations?locale=${target}`);
      setContent(JSON.stringify(data?.content ?? {}, null, 2));
      setError(null);
      setMessage(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    // Agenda fora do tick síncrono do effect (react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => load(locale));
  }, [locale, load]);

  async function handleSave() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const parsed: unknown = JSON.parse(content);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new SyntaxError("O conteúdo deve ser um objeto JSON.");
      }
      await api("/translations", { method: "PATCH", json: { locale, content: parsed } });
      setMessage("Traduções salvas.");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`JSON inválido: ${err.message}`);
      } else {
        setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Traduções</h1>
      <p className="text-muted-foreground max-w-2xl text-sm">
        Ajustes de texto por idioma. O conteúdo salvo aqui sobrepõe os textos padrão do site.
      </p>

      <div className="flex gap-2">
        {locales.map((item) => (
          <Button
            key={item}
            variant={item === locale ? "default" : "outline"}
            size="sm"
            onClick={() => setLocale(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo ({locale})</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-96 font-mono text-xs"
          spellCheck={false}
        />
      </div>

      {error ? <p className="text-error text-sm">{error}</p> : null}
      {message ? <p className="text-success text-sm">{message}</p> : null}

      <Button onClick={handleSave} disabled={busy}>
        {busy ? "Salvando..." : "Salvar traduções"}
      </Button>
    </div>
  );
}
