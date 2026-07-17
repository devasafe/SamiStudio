import { CategoryForm } from "@/components/admin/categories/category-form";

export default function NovaCategoriaPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Nova categoria</h1>
      <CategoryForm />
    </div>
  );
}
