import type { Metadata } from "next";
import { Allura, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { EditBridge } from "@/components/cms/edit-bridge";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers/providers";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Analytics } from "@/components/shared/analytics";
import { FloatingWhatsApp } from "@/components/shared/floating-whatsapp";
import { StructuredData } from "@/components/shared/structured-data";
import { isLocale, localePath, locales, type Locale } from "@/i18n/config";
import { getMergedDictionary } from "@/lib/dictionary";
import { getSiteSettings } from "@/lib/settings";
import "../globals.css";

// Conteúdo do CMS (settings) atualizado a cada 10 minutos.
export const revalidate = 600;

// Heading serif elegante — Manual da Marca (2026-07-09).
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Assinatura manuscrita da fundadora (seção Sobre).
const allura = Allura({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const dictionary = await getMergedDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${dictionary.meta.home.title} | ${dictionary.meta.siteName}`,
      template: `%s | ${dictionary.meta.siteName}`,
    },
    description: dictionary.meta.home.description,
    alternates: {
      canonical: localePath(locale, "/"),
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l, "/")])),
    },
    openGraph: {
      siteName: dictionary.meta.siteName,
      locale: locale.replace("-", "_"),
      type: "website",
    },
    // Search Console (Docs/13) — só emitida quando configurada.
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const [dictionary, settings] = await Promise.all([
    getMergedDictionary(locale),
    getSiteSettings(),
  ]);

  const whatsappNumber = settings?.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const gaMeasurementId =
    settings?.analytics?.gaMeasurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable} ${allura.variable} antialiased`}
    >
      {/* Sem altura no <html>: a Lenis mede o documento pelo scrollHeight e só
          re-mede quando a caixa do html muda — com height:100% ela nunca muda,
          e o scroll congela na altura medida antes das imagens carregarem.
          O rodapé continua no fim da tela via min-h-svh, que não é percentual. */}
      <body className="flex min-h-svh flex-col">
        <SmoothScroll />
        <EditBridge />
        <AmbientBackground />
        <Providers locale={locale} dictionary={dictionary}>
          <Navbar />
          {children}
          <Footer locale={locale} dictionary={dictionary} settings={settings} />
          {whatsappNumber ? <FloatingWhatsApp number={whatsappNumber} /> : null}
        </Providers>
        <StructuredData locale={locale} dictionary={dictionary} settings={settings} />
        <Analytics measurementId={gaMeasurementId} />
      </body>
    </html>
  );
}
