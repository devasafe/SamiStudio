"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";

const fields: FieldConfig[] = [
  { name: "siteName", label: "Nome do site", type: "text" },
  { name: "aboutPhoto", label: "Foto da Sami (seção Sobre)", type: "image", aspect: 4 / 5 },
  { name: "essencePhoto1", label: "Sobre · Foto essência 1", type: "image", aspect: 3 / 4 },
  { name: "essencePhoto2", label: "Sobre · Foto essência 2", type: "image", aspect: 3 / 4 },
  { name: "founderName", label: "Sobre · Nome na assinatura", type: "text" },
  { name: "founderRole", label: "Sobre · Cargo na assinatura", type: "text" },
  { name: "stat1Value", label: "Sobre · Número 1 (ex.: 6+)", type: "text" },
  { name: "stat1Label", label: "Sobre · Rótulo 1 (ex.: Anos de estúdio)", type: "text" },
  { name: "stat2Value", label: "Sobre · Número 2 (ex.: 120+)", type: "text" },
  { name: "stat2Label", label: "Sobre · Rótulo 2 (ex.: Projetos entregues)", type: "text" },
  { name: "stat3Value", label: "Sobre · Número 3 (ex.: 40+)", type: "text" },
  { name: "stat3Label", label: "Sobre · Rótulo 3 (ex.: Clientes atendidos)", type: "text" },
  {
    name: "contactPhoto",
    label: "Contato · Foto ao lado do formulário",
    type: "image",
    aspect: 4 / 5,
  },
  { name: "email", label: "E-mail de contato", type: "email" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "whatsapp", label: "WhatsApp (com DDI, ex.: 5511999999999)", type: "text" },
  { name: "address", label: "Endereço", type: "text" },
  {
    name: "locationNote",
    label: "Contato · Nota da localização (ex.: Atendimento online para todo o Brasil)",
    type: "text",
  },
  {
    name: "businessHours",
    label: "Contato · Horário (ex.: Segunda a Sexta das 9h às 18h)",
    type: "text",
  },
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
