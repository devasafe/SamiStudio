"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { TranslatableField, useTranslations } from "@/components/admin/translatable-field";
import { translationsPayload, type Lang, type Translations } from "@/components/admin/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FaqFormValues {
  question: string;
  answer: string;
  order: string;
  translations?: Translations;
}

const EMPTY: FaqFormValues = { question: "", answer: "", order: "" };

interface FaqFormProps {
  initial?: Partial<FaqFormValues>;
  /** Presente = edição; ausente = criação. */
  faqId?: string;
}

/**
 * O campo "categoria" do modelo fica de fora de propósito: o site só lê a
 * pergunta e a resposta (ver getFaqs), então preenchê-lo não muda nada.
 */
export function FaqForm({ initial, faqId }: FaqFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FaqFormValues>({ ...EMPTY, ...initial });
  const { translations, setTranslation } = useTranslations(initial?.translations);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Português é o campo base; en/es vão para `translations`. */
  function changeField(field: "question" | "answer", lang: Lang, value: string) {
    if (lang === "pt-BR") {
      setValues((current) => ({ ...current, [field]: value }));
    } else {
      setTranslation(lang, field, value);
    }
  }

  const fieldValues = (field: "question" | "answer"): Record<Lang, string> => ({
    "pt-BR": values[field],
    en: translations.en[field] ?? "",
    es: translations.es[field] ?? "",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        question: values.question.trim(),
        answer: values.answer.trim(),
        order: values.order ? Number(values.order) : undefined,
        translations: translationsPayload(translations),
      };
      if (faqId) {
        await api(`/faq/${faqId}`, { method: "PATCH", json: payload });
      } else {
        await api("/faq", { method: "POST", json: payload });
      }
      router.push("/admin/faq");
      router.refresh();
    } catch (err) {
      // Mantém o que foi digitado: reescrever a resposta inteira por um erro
      // de rede é o tipo de coisa que faz desistir.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <TranslatableField
          label="Pergunta"
          required
          values={fieldValues("question")}
          onChange={(lang, value) => changeField("question", lang, value)}
          placeholder="ex.: Qual o prazo médio de entrega?"
        />
        <p className="text-muted-foreground text-xs">
          Escreva como o cliente perguntaria, não como o estúdio responderia.
        </p>
      </div>

      <TranslatableField
        label="Resposta"
        multiline
        required
        values={fieldValues("answer")}
        onChange={(lang, value) => changeField("answer", lang, value)}
        placeholder="Responda direto, em uma ou duas frases."
      />

      <div className="space-y-2">
        <Label htmlFor="order">Ordem</Label>
        <Input
          id="order"
          type="number"
          value={values.order}
          onChange={(event) => setValues((current) => ({ ...current, order: event.target.value }))}
          className="max-w-32"
          placeholder="0"
        />
        <p className="text-muted-foreground text-xs">
          Menor aparece primeiro. Dá para arrastar na lista.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : faqId ? "Salvar" : "Criar pergunta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/faq")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
