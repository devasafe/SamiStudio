"use client";

import Link from "next/link";
import { useState } from "react";
import { GooglePreview } from "@/components/admin/settings/google-preview";
import { SettingsForm, type SettingsGroup } from "@/components/admin/settings/settings-form";
import { TextsForm } from "@/components/admin/settings/texts-form";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "site", label: "Site" },
  { id: "contato", label: "Contato e redes" },
  { id: "seo", label: "SEO" },
  { id: "textos", label: "Textos avançados" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SITE_GROUPS: SettingsGroup[] = [
  {
    label: "Identidade",
    hint: "O nome e o logo que aparecem no topo do site e no rodapé.",
    region: "nav",
    fields: [
      { name: "siteName", label: "Nome do site", type: "text" },
      { name: "logo", label: "Logo (URL)", type: "url" },
    ],
  },
  {
    label: "Ícone da aba",
    hint: "O quadradinho que aparece na aba do navegador e nos favoritos.",
    region: "browser",
    fields: [{ name: "favicon", label: "Favicon (URL)", type: "url" }],
  },
];

const CONTACT_GROUPS: SettingsGroup[] = [
  {
    label: "Dados de contato",
    hint: "Aparecem na página Contato e no rodapé. Campo vazio não aparece no site.",
    region: "content",
    fields: [
      { name: "email", label: "E-mail de contato", type: "email" },
      { name: "phone", label: "Telefone", type: "text" },
      { name: "whatsapp", label: "WhatsApp (com DDI, ex.: 5511999999999)", type: "text" },
      { name: "address", label: "Endereço", type: "text" },
      {
        name: "locationNote",
        label: "Nota da localização (ex.: Atendimento online para todo o Brasil)",
        type: "text",
      },
      {
        name: "businessHours",
        label: "Horário (ex.: Segunda a Sexta das 9h às 18h)",
        type: "text",
      },
    ],
  },
  {
    label: "Redes sociais",
    hint: "Viram links no rodapé. Rede sem endereço não aparece lá.",
    region: "footer",
    fields: [
      { name: "instagram", label: "Instagram (URL)", type: "url" },
      { name: "linkedin", label: "LinkedIn (URL)", type: "url" },
      { name: "facebook", label: "Facebook (URL)", type: "url" },
      { name: "youtube", label: "YouTube (URL)", type: "url" },
      { name: "behance", label: "Behance (URL)", type: "url" },
    ],
  },
];

/** SEO é tudo sob `meta.`; "avançados" é o resto sem lugar na tela. */
const isSeo = (path: string) => path.startsWith("meta.");
const isAdvanced = (path: string) => !isSeo(path);

/** Onde cada bloco de SEO aparece no site — usado na prévia do Google. */
const SEO_PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Início", path: "/" },
  { key: "about", label: "Sobre", path: "/sobre" },
  { key: "services", label: "Serviços", path: "/servicos" },
  { key: "portfolio", label: "Portfólio", path: "/portfolio" },
  { key: "contact", label: "Contato", path: "/contato" },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samidasilva.studio";

/**
 * Uma prévia por página do site: os campos de SEO não têm lugar na tela, então
 * o único jeito honesto de mostrar o efeito deles é desenhar o resultado da
 * busca com o que está sendo digitado.
 */
function renderSeoPreview(group: string, values: Record<string, string>) {
  if (group !== "meta") {
    return null;
  }
  return (
    <div className="space-y-3">
      {SEO_PAGES.map((page) => (
        <GooglePreview
          key={page.key}
          title={values[`meta.${page.key}.title`] ?? ""}
          description={values[`meta.${page.key}.description`] ?? ""}
          path={page.path}
          siteUrl={SITE_URL}
        />
      ))}
    </div>
  );
}

export default function AdminAjustesPage() {
  const [tab, setTab] = useState<TabId>("site");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          O que não dá para clicar na página: dados que ainda não existem no site, SEO e textos sem
          lugar na tela. Para o resto, use{" "}
          <Link href="/admin/editor" className="hover:text-foreground underline">
            Editar site
          </Link>
          .
        </p>
      </div>

      <nav className="border-border flex gap-1 border-b">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
              tab === item.id
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "site" ? <SettingsForm groups={SITE_GROUPS} /> : null}
      {tab === "contato" ? <SettingsForm groups={CONTACT_GROUPS} /> : null}
      {tab === "seo" ? <TextsForm filter={isSeo} renderGroupPreview={renderSeoPreview} /> : null}
      {tab === "textos" ? <TextsForm filter={isAdvanced} /> : null}
    </div>
  );
}
