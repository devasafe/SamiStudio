"use client";

import { CrudPage } from "@/components/admin/crud-page";

export default function AdminServicesPage() {
  return (
    <CrudPage
      title="Serviços"
      endpoint="/services"
      columns={[
        { key: "title", label: "Título" },
        { key: "slug", label: "Slug" },
        { key: "order", label: "Ordem" },
      ]}
      fields={[
        { name: "title", label: "Título", type: "text", required: true },
        {
          name: "slug",
          label: "Slug",
          type: "text",
          required: true,
          placeholder: "ex.: render-realista",
        },
        { name: "description", label: "Descrição", type: "textarea" },
        { name: "icon", label: "Ícone (nome Lucide)", type: "text", placeholder: "ex.: camera" },
        { name: "coverImage", label: "Imagem de capa (URL)", type: "url" },
        { name: "order", label: "Ordem", type: "number" },
      ]}
    />
  );
}
