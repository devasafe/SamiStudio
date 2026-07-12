import { ProjectForm } from "@/components/admin/projects/project-form";

export default function NovoProjetoPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Novo projeto</h1>
      <ProjectForm />
    </div>
  );
}
