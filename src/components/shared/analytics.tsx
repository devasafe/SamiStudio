import Script from "next/script";

interface AnalyticsProps {
  /** Measurement ID do GA4 (G-XXXXXXX). */
  measurementId: string;
}

/** Google Analytics 4 (Docs/13) — carregado apenas quando configurado. */
export function Analytics({ measurementId }: AnalyticsProps) {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
