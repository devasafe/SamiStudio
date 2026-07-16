"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteByPath, getByPath, parseRef, setByPath, type CmsSelection } from "@/lib/cms/refs";

/**
 * Proporção do recorte por foto — a mesma que as Configurações usavam. Recortar
 * a foto da essência em 4/5 cortaria a imagem errada.
 */
const IMAGE_ASPECTS: Record<string, number> = {
  aboutPhoto: 4 / 5,
  essencePhoto1: 3 / 4,
  essencePhoto2: 3 / 4,
  contactPhoto: 4 / 5,
};

interface EditPanelProps {
  selection: CmsSelection | null;
  locale: string;
  /** Avisa a prévia para trocar o texto na hora. */
  onSaved: (ref: string, value: string) => void;
}

interface TranslationDoc {
  content: Record<string, unknown>;
}

type Settings = Record<string, string | undefined>;

export function EditPanel({ selection, locale, onSaved }: EditPanelProps) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Memoizado em `selection`: parseRef por si só recria o objeto a cada
  // render, e colocar esse objeto instável nas deps do efeito abaixo faria a
  // busca à API rodar de novo em qualquer re-render do painel (ex.: ao
  // digitar), não só quando a seleção muda. Com a memoização, a identidade de
  // `ref` só muda quando `selection` muda, então ele pode entrar nas deps sem
  // supressão de lint.
  const ref = useMemo(() => (selection ? parseRef(selection.ref) : null), [selection]);

  // Busca o valor de verdade na fonte: o texto do DOM pode ser o base, não o
  // override salvo, e foto não tem texto nenhum.
  //
  // O reset (setError/setSaved/setValue) fica dentro do callback assíncrono,
  // não solto no corpo do effect: o lint (react-hooks/set-state-in-effect)
  // proíbe setState síncrono direto no corpo do effect. Como o callback roda
  // antes de qualquer await, o reset acontece na prática tão cedo quanto antes.
  //
  // `ignore` evita a corrida de trocar de seleção rápido: se ela clica no
  // texto A e depois no B antes da resposta de A voltar, sem essa guarda o
  // setValue de A (que pode chegar depois do de B) sobrescreveria o valor já
  // certo de B — painel mostrando o caminho/rótulo de B com o texto de A.
  useEffect(() => {
    let ignore = false;
    void (async () => {
      setError(null);
      setSaved(false);
      if (!selection || !ref) {
        setValue("");
        return;
      }
      try {
        if (ref.kind === "text") {
          const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
          if (ignore) {
            return;
          }
          // "" cai no valor padrão, não vira campo em branco: pode ser um
          // override "" gravado por uma versão anterior do painel (que
          // persistia "" em vez de remover ao voltar ao padrão) — ler isso
          // como override de verdade reproduziria o mesmo bug a cada carga.
          setValue(getByPath(data?.content, ref.path) || selection.value);
          return;
        }
        const { data } = await api<Settings | null>("/settings");
        if (ignore) {
          return;
        }
        setValue(data?.[ref.path] ?? "");
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o valor.");
        setValue(selection.value);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selection, locale, ref]);

  async function save(next: string) {
    if (!ref) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (ref.kind === "text") {
        // A rota substitui o content inteiro: parte do salvo para não apagar
        // os outros overrides do mesmo idioma.
        const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
        // Vazio (voltar ao padrão) remove o override em vez de gravar "": um ""
        // persistido seria lido de volta como override (deepMerge do servidor
        // ignora string vazia, mas a leitura acima do painel não), reproduzindo
        // o mesmo campo em branco marcado como alterado.
        const content =
          next === ""
            ? deleteByPath(data?.content ?? {}, ref.path)
            : setByPath(data?.content ?? {}, ref.path, next);
        await api("/translations", { method: "PATCH", json: { locale, content } });
      } else {
        await api("/settings", { method: "PATCH", json: { [ref.path]: next } });
      }
      setSaved(true);
      onSaved(selection!.ref, next);
    } catch (err) {
      // Mantém o texto digitado: perder o que ela escreveu é inaceitável.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (!selection) {
    return (
      <p className="text-muted-foreground text-sm">
        Clique num texto ou numa foto da página ao lado para editar.
      </p>
    );
  }

  if (!ref) {
    return <p className="text-error text-sm">Referência inválida: {selection.ref}</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg tracking-tight">
          {ref.kind === "img" ? "Foto" : ref.kind === "set" ? "Dado de contato" : "Texto"}
        </h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs break-all">{ref.path}</p>
        {ref.kind === "text" ? (
          <p className="text-muted-foreground mt-1 text-xs">Idioma: {locale}</p>
        ) : null}
        {selection.count > 1 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Este texto aparece em {selection.count} lugares desta página e muda em todos.
          </p>
        ) : null}
      </div>

      {ref.kind === "img" ? (
        <ImageField
          label="Foto"
          value={value}
          aspect={IMAGE_ASPECTS[ref.path] ?? 4 / 5}
          onChange={(url) => {
            setValue(url);
            void save(url);
          }}
        />
      ) : (
        <>
          {value.length > 80 ? (
            <Textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-40"
            />
          ) : (
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          )}
          <Button onClick={() => void save(value)} disabled={busy} className="w-full">
            {busy ? "Salvando..." : "Salvar"}
          </Button>
        </>
      )}

      {error ? <p className="text-error text-sm">{error}</p> : null}
      {saved && !error ? <p className="text-success text-sm">Salvo.</p> : null}
    </div>
  );
}
