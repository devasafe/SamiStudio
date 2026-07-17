"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import { deleteByPath, getByPath, setByPath } from "@/lib/cms/refs";

/** Idiomas do site, na ordem e rótulos do seletor do editor. */
const LOCALES = [
  { value: "pt-BR", label: "Português", dict: ptBR as Record<string, unknown> },
  { value: "en", label: "English", dict: en as Record<string, unknown> },
  { value: "es", label: "Español", dict: es as Record<string, unknown> },
] as const;

interface TranslationDoc {
  locale: string;
  content: Record<string, unknown>;
}

interface TextFieldsProps {
  /** Referência original (para avisar a prévia). */
  selectionRef: string;
  /** Caminho do texto no dicionário (ex.: sections.about.title). */
  path: string;
  /** Idioma que a prévia mostra — é o valor que atualiza na prévia ao salvar. */
  previewLocale: string;
  /** Texto renderizado na prévia — fallback do idioma da prévia se o GET falhar. */
  baseValue: string;
  /** Avisa a prévia (mesmo contrato do EditPanel). */
  onSaved: (ref: string, value: string) => void;
}

/**
 * Edição de um texto nos três idiomas de uma vez. Cada campo traz o override
 * salvo daquele idioma; vazio mostra o texto padrão do dicionário como
 * placeholder e, ao salvar, volta ao padrão (remove o override). Salva com um
 * PATCH por idioma, partindo do content salvo de cada um para não apagar os
 * outros overrides.
 */
export function TextFields({
  selectionRef,
  path,
  previewLocale,
  baseValue,
  onSaved,
}: TextFieldsProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  // Content salvo por locale: base para gravar sem apagar os outros overrides.
  const [contents, setContents] = useState<Record<string, Record<string, unknown>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Placeholder de cada idioma = texto padrão do dicionário naquele caminho.
  const placeholders = useMemo(() => {
    const map: Record<string, string> = {};
    for (const { value, dict } of LOCALES) {
      map[value] = getByPath(dict, path) ?? "";
    }
    return map;
  }, [path]);

  // Busca os overrides dos três idiomas de uma vez. `ignore` evita a corrida de
  // trocar de seleção rápido (clicar em A e depois B antes de A responder).
  useEffect(() => {
    let ignore = false;
    void (async () => {
      setError(null);
      setSaved(false);
      try {
        const { data } = await api<TranslationDoc[]>("/translations");
        if (ignore) {
          return;
        }
        const byLocale = new Map((data ?? []).map((doc) => [doc.locale, doc.content ?? {}]));
        const nextValues: Record<string, string> = {};
        const nextContents: Record<string, Record<string, unknown>> = {};
        for (const { value } of LOCALES) {
          const content = byLocale.get(value) ?? {};
          nextContents[value] = content;
          // "" cai no padrão, não vira override em branco: pode ser um "" legado
          // gravado por uma versão anterior (mesma leitura defensiva do painel).
          nextValues[value] = getByPath(content, path) || "";
        }
        setContents(nextContents);
        setValues(nextValues);
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar os textos.");
        // Sem dados, ao menos preenche o idioma da prévia com o texto visível.
        setValues({ [previewLocale]: baseValue });
        setContents({});
      }
    })();
    return () => {
      ignore = true;
    };
  }, [path, previewLocale, baseValue]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      for (const { value: locale } of LOCALES) {
        const next = values[locale] ?? "";
        const base = contents[locale] ?? {};
        // Vazio volta ao padrão (remove o override) em vez de gravar "".
        const content = next === "" ? deleteByPath(base, path) : setByPath(base, path, next);
        await api("/translations", { method: "PATCH", json: { locale, content } });
      }
      setSaved(true);
      // Só o idioma que a prévia mostra precisa refletir agora.
      onSaved(selectionRef, values[previewLocale] ?? "");
    } catch (err) {
      // Mantém o que foi digitado: perder o texto é inaceitável.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  function setLocaleValue(locale: string, value: string) {
    setValues((prev) => ({ ...prev, [locale]: value }));
  }

  return (
    <div className="space-y-4">
      {LOCALES.map(({ value: locale, label }) => {
        const current = values[locale] ?? "";
        const long = current.length > 80 || placeholders[locale].length > 80;
        return (
          <div key={locale} className="space-y-1">
            <label className="text-muted-foreground text-xs">{label}</label>
            {long ? (
              <Textarea
                value={current}
                placeholder={placeholders[locale]}
                onChange={(event) => setLocaleValue(locale, event.target.value)}
                className="min-h-24"
              />
            ) : (
              <Input
                value={current}
                placeholder={placeholders[locale]}
                onChange={(event) => setLocaleValue(locale, event.target.value)}
              />
            )}
          </div>
        );
      })}

      <Button onClick={() => void save()} disabled={busy} className="w-full">
        {busy ? "Salvando..." : "Salvar"}
      </Button>

      {error ? <p className="text-error text-sm">{error}</p> : null}
      {saved && !error ? <p className="text-success text-sm">Salvo.</p> : null}
    </div>
  );
}
