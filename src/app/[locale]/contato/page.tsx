import type { Metadata } from "next";
import Image from "next/image";
import type { ComponentType } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { Clock, Instagram, Mail, MapPin, Phone, Sparkles } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { FAQSection } from "@/components/shared/faq-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFaqs } from "@/lib/content";
import { safeImageUrl } from "@/lib/images";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/settings";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** "https://instagram.com/samidasilvastudio/" → "@samidasilvastudio". */
function instagramHandle(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  const handle = url.split("?")[0].replace(/\/+$/, "").split("/").pop();
  return handle ? `@${handle}` : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.contact.title,
    description: dictionary.meta.contact.description,
    locale,
    path: "/contato",
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const [settings, faqs] = await Promise.all([getSiteSettings(), getFaqs(locale, dictionary)]);
  const page = dictionary.contactPage;

  // Cada bloco só entra se o dado existir nas Configurações — sem linha vazia.
  // Cada linha carrega seu próprio campo (`field`): a Localização tem duas
  // (endereço + complemento) e o filtro abaixo pode remover qualquer uma das
  // duas, então a posição sozinha não diz qual campo é qual.
  const channels = [
    {
      icon: Mail,
      label: page.emailLabel,
      labelRef: "contactPage.emailLabel",
      lines: [{ value: settings?.email, field: "email" }],
    },
    {
      icon: Phone,
      label: page.phoneLabel,
      labelRef: "contactPage.phoneLabel",
      lines: [{ value: settings?.phone, field: "phone" }],
    },
    {
      icon: Instagram,
      label: page.instagramLabel,
      labelRef: "contactPage.instagramLabel",
      lines: [{ value: instagramHandle(settings?.instagram), field: "instagram" }],
      href: settings?.instagram,
    },
    {
      icon: MapPin,
      label: page.locationLabel,
      labelRef: "contactPage.locationLabel",
      lines: [
        { value: settings?.address, field: "address" },
        { value: settings?.locationNote, field: "locationNote" },
      ],
    },
    {
      icon: Clock,
      label: page.hoursLabel,
      labelRef: "contactPage.hoursLabel",
      lines: [{ value: settings?.businessHours, field: "businessHours" }],
    },
  ]
    .map((channel) => ({
      ...channel,
      lines: channel.lines.filter((line): line is { value: string; field: string } => !!line.value),
    }))
    .filter((channel) => channel.lines.length > 0);

  const photo = safeImageUrl(settings?.contactPhoto);

  return (
    <main className="flex-1 bg-[#141009] pt-22 text-[#f2ece0]">
      {/* Hero: chamada à esquerda, canais de contato à direita */}
      <Container>
        <section className="grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <p
              className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
              data-cms="text:contactPage.heroEyebrow"
            >
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {page.heroEyebrow}
            </p>
            <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-tight text-balance">
              <span data-cms="text:contactPage.heroTitleLead">{page.heroTitleLead}</span>{" "}
              <span className="text-[#cf5a18] italic" data-cms="text:contactPage.heroTitleEmphasis">
                {page.heroTitleEmphasis}
              </span>
            </h1>
            <p
              className="text-small mt-8 max-w-md leading-relaxed text-[#d8cdba]"
              data-cms="text:contactPage.heroText"
            >
              {page.heroText}
            </p>
          </div>

          {channels.length > 0 ? (
            // h-full + justify-center: o fio acompanha a coluna inteira e os
            // canais ficam centralizados na altura do texto ao lado.
            <dl className="flex flex-col justify-center space-y-8 lg:h-full lg:border-l lg:border-[#f2ece0]/12 lg:pl-16">
              {channels.map((channel) => (
                <Channel
                  key={channel.label}
                  icon={channel.icon}
                  label={channel.label}
                  labelRef={channel.labelRef}
                  lines={channel.lines}
                  href={channel.href}
                />
              ))}
            </dl>
          ) : null}
        </section>
      </Container>

      {/* Formulário + foto */}
      <section className="border-t border-[#f2ece0]/10 bg-[#0f0c09]">
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2
              className="font-heading flex items-center gap-5 text-[clamp(1.6rem,2.6vw,2.1rem)] tracking-tight"
              data-cms="text:contactPage.formTitle"
            >
              <span className="h-px w-10 bg-[#cf5a18]" aria-hidden />
              {page.formTitle}
            </h2>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] w-full" data-cms="img:contactPhoto">
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="size-full bg-[#221a13]" />
              )}
            </div>
            {/* Cartão de apoio sobreposto à base da foto */}
            <div className="border border-[#f2ece0]/10 bg-[#0f0c09]/90 p-6 backdrop-blur-sm lg:absolute lg:right-10 lg:bottom-8 lg:left-0">
              <Sparkles className="size-5 text-[#cf5a18]" strokeWidth={1} aria-hidden />
              <h3 className="font-heading mt-4 text-xl" data-cms="text:contactPage.cardTitle">
                {page.cardTitle}
              </h3>
              <p
                className="text-small mt-3 leading-relaxed text-[#d8cdba]/75"
                data-cms="text:contactPage.cardText"
              >
                {page.cardText}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Dúvidas frequentes */}
      <FAQSection locale={locale} dictionary={dictionary} items={faqs} />
    </main>
  );
}

interface ChannelLine {
  value: string;
  /** Campo em Configurações que originou o valor (ex.: "email", "address"). */
  field: string;
}

interface ChannelProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  /** Caminho do rótulo no dicionário (ex.: "contactPage.emailLabel"). */
  labelRef: string;
  lines: ChannelLine[];
  /** Quando existe, a primeira linha vira link externo (ex.: perfil no Instagram). */
  href?: string;
}

/** Canal de contato: ícone, rótulo e uma ou duas linhas de informação. */
function Channel({ icon: Icon, label, labelRef, lines, href }: ChannelProps) {
  const [first, ...rest] = lines;

  return (
    <div className="flex gap-5">
      <span className="flex size-11 shrink-0 items-center justify-center border border-[#cf5a18]/40 text-[#cf5a18]">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <div>
        <dt
          className="text-caption tracking-[0.18em] text-[#f2ece0]/45 uppercase"
          data-cms={`text:${labelRef}`}
        >
          {label}
        </dt>
        <dd
          className="text-small mt-1.5 leading-relaxed text-[#f2ece0]"
          data-cms={`set:${first.field}`}
        >
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-[#cf5a18]"
            >
              {first.value}
            </a>
          ) : (
            first.value
          )}
        </dd>
        {rest.map((line) => (
          <dd
            key={line.field}
            className="text-small mt-1.5 leading-relaxed text-[#f2ece0]"
            data-cms={`set:${line.field}`}
          >
            {line.value}
          </dd>
        ))}
      </div>
    </div>
  );
}
