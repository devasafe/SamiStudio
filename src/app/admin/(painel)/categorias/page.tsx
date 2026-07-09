"use client";

import { CrudPage } from "@/components/admin/crud-page";

export default function AdminCategoriesPage() {
  return (
    <CrudPage
      title="Categorias"
      endpoint="/categories"
      columns={[
        { key: "name", label: "Nome" },
        { key: "slug", label: "Slug" },
        { key: "order", label: "Ordem" },
      ]}
      fields={[
        { name: "name", label: "Nome", type: "text", required: true },
        {
          name: "slug",
          label: "Slug",
          type: "text",
          required: true,
          placeholder: "ex.: interiores",
        },
        { name: "order", label: "Ordem", type: "number" },
      ]}
    />
  );
}
