"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_TRANSLATIONS,
  TRANSLATABLE_LANGS,
  type Lang,
  type Translations,
} from "@/components/admin/translations";

interface TranslatableFieldProps {
  label: string;
  /** Textarea em vez de Input. */
  multiline?: boolean;
  /** Aplica-se só ao português (as traduções são sempre opcionais). */
  required?: boolean;
  placeholder?: string;
  /** Valor por idioma; en/es vazios fazem o site cair no português. */
  values: Record<Lang, string>;
  onChange: (lang: Lang, value: string) => void;
}

/**
 * Um campo de texto editável nos três idiomas, empilhados (Português / English
 * / Español). Só o português é obrigatório; en/es em branco usam o português
 * no site. Espelha o padrão do editor visual (text-fields.tsx), mas para os
 * formulários de CRUD (FAQ, serviços, depoimentos, projetos).
 */
export function TranslatableField({
  label,
  multiline,
  required,
  placeholder,
  values,
  onChange,
}: TranslatableFieldProps) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {TRANSLATABLE_LANGS.map(({ code, label: langLabel }) => {
        const isBase = code === "pt-BR";
        const ph = isBase ? placeholder : "Vazio usa o texto em português";
        return (
          <div key={code} className="space-y-1">
            <span className="text-muted-foreground text-xs">{langLabel}</span>
            {multiline ? (
              <Textarea
                value={values[code]}
                required={isBase && required}
                placeholder={ph}
                onChange={(event) => onChange(code, event.target.value)}
                className="min-h-28"
              />
            ) : (
              <Input
                value={values[code]}
                required={isBase && required}
                placeholder={ph}
                onChange={(event) => onChange(code, event.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Estado das traduções (en/es) de um formulário, com o setter por campo. O
 * pt-BR fica no state base do próprio formulário; aqui só en/es.
 */
export function useTranslations(initial?: Translations) {
  const [translations, setTranslations] = useState<Translations>(initial ?? EMPTY_TRANSLATIONS);

  function setTranslation(lang: "en" | "es", field: string, value: string) {
    setTranslations((current) => ({
      ...current,
      [lang]: { ...current[lang], [field]: value },
    }));
  }

  return { translations, setTranslation };
}
