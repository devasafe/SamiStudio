"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";
import { PageDiagram, type PageRegion } from "@/components/admin/settings/page-diagram";

export interface SettingsGroup {
  label: string;
  /** Onde isso aparece, em uma frase — o desenho ao lado mostra a região. */
  hint: string;
  region: PageRegion;
  fields: FieldConfig[];
}

interface SettingsFormProps {
  groups: SettingsGroup[];
}

/**
 * Configurações do site, em grupos: cada um diz onde aparece e salva sozinho.
 *
 * Salvar por grupo é de propósito — o PATCH é parcial, então mandar só os
 * campos daquele bloco não toca nos outros.
 */
export function SettingsForm({ groups }: SettingsFormProps) {
  const [initialValues, setInitialValues] = useState<EntityValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<EntityValues | null>("/settings");
        setInitialValues(data ?? {});
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
        setInitialValues({});
      }
    })();
  }, []);

  async function handleSubmit(group: string, values: EntityValues) {
    setBusy(group);
    setError(null);
    setSaved(null);
    try {
      await api("/settings", { method: "PATCH", json: values });
      setSaved(group);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(null);
    }
  }

  if (!initialValues) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.label} className="border-border rounded-xl border">
          <header className="border-border flex items-center gap-4 border-b p-5">
            <PageDiagram region={group.region} className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-heading">{group.label}</h2>
              <p className="text-muted-foreground text-xs">{group.hint}</p>
            </div>
          </header>

          <div className="max-w-xl p-5">
            <EntityForm
              fields={group.fields}
              initialValues={initialValues}
              submitLabel="Salvar"
              busy={busy === group.label}
              onSubmit={(values) => handleSubmit(group.label, values)}
            />
            {saved === group.label ? <p className="text-primary mt-3 text-sm">Salvo.</p> : null}
          </div>
        </section>
      ))}
    </div>
  );
}
