import { ServiceForm } from "@/components/admin/services/service-form";

export default function NovoServicoPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Novo serviço</h1>
      <ServiceForm />
    </div>
  );
}
