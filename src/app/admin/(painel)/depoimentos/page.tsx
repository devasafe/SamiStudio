"use client";

import { CrudPage } from "@/components/admin/crud-page";

export default function AdminTestimonialsPage() {
  return (
    <CrudPage
      title="Depoimentos"
      endpoint="/testimonials"
      columns={[
        { key: "name", label: "Nome" },
        { key: "company", label: "Empresa" },
        { key: "rating", label: "Nota" },
        { key: "featured", label: "Destaque" },
      ]}
      fields={[
        { name: "name", label: "Nome", type: "text", required: true },
        { name: "company", label: "Empresa", type: "text" },
        { name: "role", label: "Cargo", type: "text" },
        { name: "photo", label: "Foto (URL)", type: "url" },
        { name: "text", label: "Depoimento", type: "textarea", required: true },
        { name: "rating", label: "Nota (1 a 5)", type: "number" },
        { name: "order", label: "Ordem", type: "number" },
        { name: "featured", label: "Exibir em destaque", type: "checkbox" },
      ]}
    />
  );
}
