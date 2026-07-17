"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditPanel } from "@/components/admin/editor/edit-panel";
import { isLocale, localePath } from "@/i18n/config";
import { rememberLocale } from "@/i18n/remember-locale";
import { parseRef, type CmsSelection } from "@/lib/cms/refs";
import { isTrustedEditMessage, type CmsMessage } from "@/lib/cms/protocol";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Início", path: "" },
  { label: "Sobre", path: "/sobre" },
  { label: "Serviços", path: "/servicos" },
  { label: "Portfólio", path: "/portfolio" },
  { label: "Contato", path: "/contato" },
];

const LOCALES = [
  { label: "Português", value: "pt-BR" },
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
];

/** Se o overlay não responder nisto, algo quebrou — melhor dizer do que fingir. */
const HANDSHAKE_TIMEOUT_MS = 5000;
/** Intervalo entre tentativas de handshake (ver enableEditing). */
const HANDSHAKE_RETRY_MS = 250;

export default function AdminEditorPage() {
  const [locale, setLocale] = useState("pt-BR");
  const [page, setPage] = useState("");
  const [selected, setSelected] = useState<CmsSelection | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** O laço de retry não enxerga o state: lê o ref. */
  const readyRef = useRef(false);
  /**
   * Guarda o intervalo em andamento fora do closure de enableEditing: assim
   * uma nova chamada (troca de página/idioma) ou o unmount conseguem
   * cancelar um retry de uma rodada anterior antes que ele mexa em estado
   * que já não é mais dele.
   */
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const source = iframeRef.current?.contentWindow;
      if (!isTrustedEditMessage(event, window.location.origin, source)) {
        return;
      }
      const data = event.data as CmsMessage;
      if (data.type === "cms:ready") {
        readyRef.current = true;
        setStatus("ready");
      }
      if (data.type === "cms:select") {
        setSelected({ ref: data.ref, value: data.value, count: data.count });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /**
   * Chamado a cada carga do iframe: se ela clicar num link dentro da prévia, o
   * modo precisa voltar a ligar.
   *
   * Repete até o overlay confirmar com "cms:ready" porque o EditBridge só passa
   * a ouvir depois que o React hidrata — uma única mensagem no onLoad pode
   * chegar antes disso e se perder, deixando a prévia muda para sempre.
   */
  const enableEditing = useCallback(() => {
    // Uma rodada anterior (página/idioma trocados antes do handshake acabar)
    // não pode sobreviver: sem isso, dois intervalos correm ao mesmo tempo e
    // o mais velho pode marcar "failed" sobre o estado da rodada nova.
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    readyRef.current = false;
    setStatus("loading");
    const startedAt = Date.now();

    timerRef.current = window.setInterval(() => {
      if (readyRef.current) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        return;
      }
      if (Date.now() - startedAt > HANDSHAKE_TIMEOUT_MS) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        // Sem "cms:ready" a tempo, a prévia ficaria muda e sem explicação.
        setStatus("failed");
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        { type: "cms:enable" } satisfies CmsMessage,
        window.location.origin
      );
    }, HANDSHAKE_RETRY_MS);
  }, []);

  useEffect(() => {
    // Ao desmontar (sair de /admin/editor), um retry pendente não pode
    // continuar chamando postMessage/setStatus contra um componente que já
    // não existe mais.
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="-m-8 flex h-svh flex-col">
      <header className="border-border flex items-center gap-6 border-b px-6 py-3">
        <h1 className="font-heading text-lg tracking-tight">Editar site</h1>

        <div className="flex gap-1">
          {PAGES.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                setPage(item.path);
                setSelected(null);
                setStatus("loading");
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                page === item.path
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          value={locale}
          onChange={(event) => {
            // Grava a escolha antes de trocar o src. O espanhol mora na URL sem
            // prefixo, onde o proxy negocia pelo Accept-Language: sem o cookie,
            // pedir "Español" num navegador em português traria a prévia em
            // português. O cookie é o que vence a detecção.
            rememberLocale(event.target.value);
            setLocale(event.target.value);
            setSelected(null);
            setStatus("loading");
          }}
          className="border-border ml-auto rounded-md border px-3 py-1.5 text-sm"
        >
          {LOCALES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </header>

      <p
        className={cn(
          "border-border border-b px-6 py-2 text-sm",
          status === "failed" ? "text-error" : "text-muted-foreground"
        )}
      >
        {status === "ready"
          ? "Clique em qualquer texto ou foto da página para editar."
          : status === "loading"
            ? "Carregando a prévia..."
            : "Não foi possível ativar a edição nesta página. Recarregue para tentar de novo."}
      </p>

      <div className="flex min-h-0 flex-1">
        <iframe
          ref={iframeRef}
          // localePath e não `/${locale}${page}`: o idioma padrão não leva
          // prefixo, e a URL prefixada dele só cairia num redirect.
          src={isLocale(locale) ? localePath(locale, page || "/") : "/"}
          onLoad={enableEditing}
          title="Prévia do site"
          className="min-w-0 flex-1"
        />
        <aside className="border-border w-96 shrink-0 overflow-y-auto border-l p-6">
          <EditPanel
            selection={selected}
            locale={locale}
            onSaved={(ref, value) => {
              // Foto e dado de contato não têm o valor como texto na tela:
              // recarrega a prévia em vez de escrever por cima do que aparece.
              //
              // "Voltar ao padrão" (value === "") também recarrega, em vez de
              // aplicar o patch otimista: o edit-overlay faria textContent = ""
              // e o título sumiria da prévia até a próxima navegação — o
              // servidor volta a renderizar o texto padrão (deepMerge ignora
              // ""), mas só depois de recarregar é que a prévia mostra isso.
              if (parseRef(ref)?.kind !== "text" || value === "") {
                iframeRef.current?.contentWindow?.location.reload();
                return;
              }
              iframeRef.current?.contentWindow?.postMessage(
                { type: "cms:patch", ref, value } satisfies CmsMessage,
                window.location.origin
              );
            }}
          />
        </aside>
      </div>
    </div>
  );
}
