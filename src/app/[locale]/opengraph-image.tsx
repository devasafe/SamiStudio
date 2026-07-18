import { ImageResponse } from "next/og";

// Tamanho padrão para preview em redes sociais / WhatsApp.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sami da Silva Studio";

const EYEBROW: Record<string, string> = {
  "pt-BR": "Visualização Arquitetônica",
  en: "Architectural Visualization",
  es: "Visualización Arquitectónica",
};

/**
 * Imagem de compartilhamento gerada no build. Usa a fonte embutida do
 * renderizador do next/og (Satori) — sem carregar fonte externa — mantendo
 * a identidade do site (fundo quente escuro + terracota) só com cor e
 * layout. O eyebrow varia por idioma; o resto do texto é fixo.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const eyebrow = EYEBROW[locale] ?? EYEBROW["es"];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#141009",
        color: "#f2ece0",
      }}
    >
      <div
        style={{
          fontSize: 28,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#cf5a18",
        }}
      >
        {eyebrow}
      </div>
      {/* O Satori (motor do next/og) exige `display: flex` explícito em
            qualquer elemento com mais de um filho — por isso o flex aqui e os
            dois spans em vez de texto solto + span. */}
      <div
        style={{
          display: "flex",
          fontSize: 96,
          marginTop: 24,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        <span>Sami da Silva</span>
        <span style={{ color: "#8a8178", marginLeft: 20 }}>Studio</span>
      </div>
      <div style={{ fontSize: 34, marginTop: 28, color: "#d8cdba" }}>From Blueprint to Reality</div>
    </div>,
    { ...size }
  );
}
