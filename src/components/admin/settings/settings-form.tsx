"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";

interface SettingsFormProps {
  fields: FieldConfig[];
}

/** Formulário de /settings restrito aos campos recebidos (uma aba dos Ajustes). */
export function SettingsForm({ fields }: SettingsFormProps) {
  const [initialValues, setInitialValues] = useState<EntityValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function handleSubmit(values: EntityValues) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await api("/settings", { method: "PATCH", json: values });
      setMessage("Configurações salvas.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (!initialValues) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}
      {message ? <p className="text-success text-sm">{message}</p> : null}
      <EntityForm
        fields={fields}
        initialValues={initialValues}
        submitLabel="Salvar"
        busy={busy}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
