"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ImageUploader } from "@/components/admin/projects/image-uploader";
import { TranslatableField, useTranslations } from "@/components/admin/translatable-field";
import { translationsPayload, type Lang, type Translations } from "@/components/admin/translations";
import { Box, Building2, Camera, PencilRuler, Sparkles } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ServiceFormValues {
  title: string;
  slug: string;
  description: string;
  icon: string;
  coverImage: string;
  order: string;
  translations?: Translations;
}

const EMPTY: ServiceFormValues = {
  title: "",
  slug: "",
  description: "",
  icon: "",
  coverImage: "",
  order: "",
};

/**
 * Os ícones que o site sabe desenhar (ver components/services/service-icon.ts).
 * Escolher da lista em vez de digitar o nome: um nome fora desta lista é
 * ignorado em silêncio, e o serviço aparece com o ícone de outro.
 */
const ICONS = [
  { value: "box", label: "Cubo", Icon: Box },
  { value: "camera", label: "Câmera", Icon: Camera },
  { value: "building", label: "Prédio", Icon: Building2 },
  { value: "pencil-ruler", label: "Régua", Icon: PencilRuler },
  { value: "sparkles", label: "Brilho", Icon: Sparkles },
];

/** "Maquete Eletrônica" → "maquete-eletronica" */
function slugify(value: string): string {
  return (
    value
      // NFD separa a letra do acento; o \p{Diacritic} então descarta o acento
      // solto, e "Eletrônica" vira "Eletronica" em vez de "Eletr-nica".
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

interface ServiceFormProps {
  initial?: Partial<ServiceFormValues>;
  /** Presente = edição; ausente = criação. */
  serviceId?: string;
}

export function ServiceForm({ initial, serviceId }: ServiceFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ServiceFormValues>({ ...EMPTY, ...initial });
  const { translations, setTranslation } = useTranslations(initial?.translations);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Slug editado à mão para de seguir o título: quem mexeu tem um motivo, e
  // trocar o slug de um serviço já publicado quebra o link dele.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  /** Português é o campo base; en/es vão para `translations`. O título em
   * português ainda alimenta o slug (as traduções não mexem no endereço). */
  function changeField(field: "title" | "description", lang: Lang, value: string) {
    if (lang !== "pt-BR") {
      setTranslation(lang, field, value);
      return;
    }
    set(field, value);
    if (field === "title" && !slugTouched) {
      set("slug", slugify(value));
    }
  }

  const fieldValues = (field: "title" | "description"): Record<Lang, string> => ({
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
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        description: values.description.trim() || undefined,
        icon: values.icon || undefined,
        coverImage: values.coverImage || undefined,
        order: values.order ? Number(values.order) : undefined,
        translations: translationsPayload(translations),
      };
      if (serviceId) {
        await api(`/services/${serviceId}`, { method: "PATCH", json: payload });
      } else {
        await api("/services", { method: "POST", json: payload });
      }
      router.push("/admin/servicos");
      router.refresh();
    } catch (err) {
      // Mantém o que foi digitado: refazer o formulário por causa de um erro
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

      <TranslatableField
        label="Título"
        required
        values={fieldValues("title")}
        onChange={(lang, value) => changeField("title", lang, value)}
        placeholder="ex.: Render Realista"
      />

      <div className="space-y-2">
        <Label htmlFor="slug">Endereço no site</Label>
        <Input
          id="slug"
          value={values.slug}
          required
          onChange={(event) => {
            setSlugTouched(true);
            set("slug", slugify(event.target.value));
          }}
          placeholder="ex.: render-realista"
        />
        <p className="text-muted-foreground text-xs">
          Preenchido pelo título. Só letras minúsculas, números e hífen.
        </p>
      </div>

      <TranslatableField
        label="Descrição"
        multiline
        values={fieldValues("description")}
        onChange={(lang, value) => changeField("description", lang, value)}
        placeholder="O que este serviço entrega, em uma ou duas frases."
      />

      <div className="space-y-2">
        <Label>Ícone</Label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("icon", values.icon === value ? "" : value)}
              aria-pressed={values.icon === value}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border px-5 py-3 transition-colors",
                values.icon === value
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-6" strokeWidth={1.5} aria-hidden />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Sem escolher, o site usa um ícone conforme a posição do serviço.
        </p>
      </div>

      <ImageUploader
        label="Imagem de capa"
        hint="600 × 450 px (4:3)"
        value={values.coverImage}
        onChange={(url) => set("coverImage", url)}
      />

      <div className="space-y-2">
        <Label htmlFor="order">Ordem</Label>
        <Input
          id="order"
          type="number"
          value={values.order}
          onChange={(event) => set("order", event.target.value)}
          className="max-w-32"
          placeholder="0"
        />
        <p className="text-muted-foreground text-xs">Menor aparece primeiro na lista do site.</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : serviceId ? "Salvar" : "Criar serviço"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/servicos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
