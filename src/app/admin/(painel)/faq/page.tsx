"use client";

import { CrudPage } from "@/components/admin/crud-page";

export default function AdminFaqPage() {
  return (
    <CrudPage
      title="FAQ"
      endpoint="/faq"
      columns={[
        { key: "question", label: "Pergunta" },
        { key: "category", label: "Categoria" },
        { key: "order", label: "Ordem" },
      ]}
      fields={[
        { name: "question", label: "Pergunta", type: "text", required: true },
        { name: "answer", label: "Resposta", type: "textarea", required: true },
        { name: "category", label: "Categoria", type: "text" },
        { name: "order", label: "Ordem", type: "number" },
      ]}
    />
  );
}
