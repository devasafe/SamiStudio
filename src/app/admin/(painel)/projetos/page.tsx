"use client";

import { CrudPage } from "@/components/admin/crud-page";

export default function AdminProjectsPage() {
  return (
    <CrudPage
      title="Projetos"
      endpoint="/projects"
      columns={[
        { key: "title", label: "Título" },
        { key: "slug", label: "Slug" },
        { key: "city", label: "Cidade" },
        { key: "year", label: "Ano" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "title", label: "Título", type: "text", required: true },
        {
          name: "slug",
          label: "Slug (URL)",
          type: "text",
          required: true,
          placeholder: "ex.: interior-miraflores",
        },
        { name: "description", label: "Descrição", type: "textarea" },
        { name: "client", label: "Cliente", type: "text" },
        { name: "city", label: "Cidade", type: "text" },
        { name: "country", label: "País", type: "text" },
        { name: "year", label: "Ano", type: "number" },
        { name: "categoryId", label: "Categoria", type: "select" },
        { name: "coverImage", label: "Imagem de capa", type: "image", aspect: 4 / 3 },
        { name: "featured", label: "Projeto em destaque", type: "checkbox" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "draft", label: "Rascunho" },
            { value: "published", label: "Publicado" },
            { value: "archived", label: "Arquivado" },
          ],
        },
      ]}
      remoteOptions={{
        field: "categoryId",
        endpoint: "/categories",
        valueKey: "_id",
        labelKey: "name",
      }}
    />
  );
}
