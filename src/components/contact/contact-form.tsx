"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Lock } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD_CLASS =
  "text-small w-full border border-[#f2ece0]/15 bg-transparent px-5 py-4 text-[#f2ece0] outline-none transition-colors duration-300 placeholder:text-[#d8cdba]/45 focus:border-[#cf5a18]";

/**
 * Formulário de contato: envia para a API pública, que guarda a mensagem
 * para leitura no painel. Mantém o que foi digitado se o envio falhar.
 */
export function ContactForm() {
  const { dictionary } = useLanguage();
  const page = dictionary.contactPage;
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        // A API devolve o motivo (validação, rate limit); só cai no genérico sem ele.
        throw new Error(body?.message ?? page.error);
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : page.error);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          required
          autoComplete="name"
          placeholder={page.fieldName}
          aria-label={page.fieldName}
          className={FIELD_CLASS}
        />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={page.fieldEmail}
          aria-label={page.fieldEmail}
          className={FIELD_CLASS}
        />
      </div>
      <input
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder={page.fieldPhone}
        aria-label={page.fieldPhone}
        className={FIELD_CLASS}
      />
      <input
        name="subject"
        placeholder={page.fieldSubject}
        aria-label={page.fieldSubject}
        className={FIELD_CLASS}
      />
      <textarea
        name="message"
        required
        rows={6}
        placeholder={page.fieldMessage}
        aria-label={page.fieldMessage}
        className={`${FIELD_CLASS} resize-y`}
      />

      {/* Honeypot: invisível para gente, atraente para bots. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] size-0 opacity-0"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="text-caption group flex w-full items-center justify-center gap-3 bg-[#cf5a18] px-8 py-4 tracking-[0.18em] text-[#0f0c09] uppercase transition-colors duration-300 hover:bg-[#e06a24] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* "Enviando..." é estado passageiro e não tem como ser clicado: a
            marcação fica no rótulo em repouso. */}
        <span data-cms="text:contactPage.submit">
          {status === "sending" ? page.sending : page.submit}
        </span>
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        />
      </button>

      {/* Retorno do envio (lido em voz alta por leitores de tela) */}
      <p aria-live="polite" className="min-h-5">
        {status === "sent" ? (
          <span className="text-small text-[#cf5a18]">{page.success}</span>
        ) : null}
        {status === "error" ? <span className="text-small text-[#e5674f]">{error}</span> : null}
      </p>

      <p className="text-caption flex items-center gap-2 text-[#d8cdba]/50">
        <Lock className="size-3.5" strokeWidth={1.5} aria-hidden />
        <span data-cms="text:contactPage.privacy">{page.privacy}</span>
      </p>
    </form>
  );
}
