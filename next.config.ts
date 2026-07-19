import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy do site. Precisa liberar, de propósito:
 *  - Cloudinary (imagens do CMS) e o CDN de bandeiras do seletor de telefone
 *    (react-phone-number-input) em img-src;
 *  - o próprio site em frame-src/frame-ancestors, porque o editor visual
 *    (/admin/editor) mostra a prévia num iframe same-origin.
 * Nenhum host do Google aqui: o site não usa Analytics (decisão do projeto).
 * Se um dia entrar, o Tag Manager volta a script-src e os beacons do GA4 a
 * connect-src — estes últimos com wildcard, porque o GA escolhe um endpoint
 * regional por visitante.
 * `unsafe-inline` em script/style é exigido pelo Next (styled-jsx e os estilos
 * do Tailwind injetados). Em dev, o Turbopack usa eval e o HMR abre um
 * websocket — por isso `unsafe-eval` e `ws:` só em dev.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://purecatamphetamine.github.io",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

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
