import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy do site. Precisa liberar, de propósito:
 *  - Cloudinary (imagens do CMS) em img-src;
 *  - Google Tag Manager (script do GA) em script-src, e os beacons do GA em
 *    connect-src;
 *  - o próprio site em frame-src/frame-ancestors, porque o editor visual
 *    (/admin/editor) mostra a prévia num iframe same-origin.
 * `unsafe-inline` em script/style é exigido pelo Next (styled-jsx, o snippet
 * inline do gtag e os estilos do Tailwind injetados). Em dev, o Turbopack usa
 * eval e o HMR abre um websocket — por isso `unsafe-eval` e `ws:` só em dev.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com${isDev ? " ws:" : ""}`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .concat(";");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // O anti-clickjacking real é o frame-ancestors da CSP; este é o fallback
  // para navegadores antigos. SAMEORIGIN permite o iframe do editor.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  // Não anunciar "Next.js" no cabeçalho X-Powered-By.
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    // AVIF primeiro (menor), WebP como fallback; ambos servidos conforme o
    // navegador aceita. As qualidades fora do padrão 75 precisam ser listadas.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 92],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
