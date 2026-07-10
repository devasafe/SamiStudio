"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";

const fields: FieldConfig[] = [
  { name: "siteName", label: "Nome do site", type: "text" },
  { name: "aboutPhoto", label: "Foto da Sami (seção Sobre)", type: "image", aspect: 4 / 5 },
  { name: "email", label: "E-mail de contato", type: "email" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "whatsapp", label: "WhatsApp (com DDI, ex.: 5511999999999)", type: "text" },
  { name: "address", label: "Endereço", type: "text" },
  { name: "instagram", label: "Instagram (URL)", type: "url" },
  { name: "linkedin", label: "LinkedIn (URL)", type: "url" },
  { name: "facebook", label: "Facebook (URL)", type: "url" },
  { name: "youtube", label: "YouTube (URL)", type: "url" },
  { name: "behance", label: "Behance (URL)", type: "url" },
];

export default function AdminSettingsPage() {
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

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Configurações</h1>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}
      {message ? <p className="text-success text-sm">{message}</p> : null}

      {initialValues ? (
        <EntityForm
          fields={fields}
          initialValues={initialValues}
          submitLabel="Salvar configurações"
          busy={busy}
          onSubmit={handleSubmit}
        />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
    </div>
  );
}
