# Correções da Auditoria de RNFs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os 6 achados da auditoria de RNFs do SamiStudio: headers de segurança, imagem de compartilhamento (OG), AVIF, alvos de toque no mobile, dependências vulneráveis e a limitação do rate limit — deixando os requisitos não-funcionais fechados no que é código.

**Architecture:** Mudanças pontuais e isoladas: os cabeçalhos de segurança e o AVIF concentram-se no `next.config.ts`; a imagem de compartilhamento é um arquivo `opengraph-image` que o Next monta sozinho; os alvos de toque são ajustes de padding nos links de nav/rodapé; dependências via `npm`; o rate limit é documentado (a troca por solução distribuída fica como melhoria opcional registrada).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, `next/og`.

## Global Constraints

- TypeScript strict: `any`/`ts-ignore` proibidos (Claude.md).
- Não quebrar o que já funciona: o **editor visual** (`/admin/editor`) carrega o site público num **iframe same-origin**, o **Google Analytics** injeta script de `www.googletagmanager.com`, e as **imagens** vêm de `res.cloudinary.com` — a CSP precisa permitir esses três, senão o site quebra. Toda task que mexe em headers verifica isso.
- Commits: Conventional Commits, um tipo no header, subject sem maiúscula inicial (commitlint).
- Verificação de headers é via `curl -I` (não há teste unitário de config); o site precisa estar rodando (`npm run dev`).
- Ao editar `next.config.ts`, **reiniciar o `npm run dev`** — mudança de config não faz hot-reload.

---

### Task 1: Cabeçalhos de segurança, AVIF e ocultar tecnologia (`next.config.ts`)

**Files:**
- Modify: `next.config.ts` (na raiz do projeto)

**Interfaces:**
- Produces: uma função `headers()` no config que aplica cabeçalhos de segurança a todas as rotas; `poweredByHeader: false`; `images.formats` com AVIF+WebP.

- [ ] **Step 1: Reescrever o `next.config.ts`**

Substituir todo o conteúdo de `next.config.ts` por:

```ts
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
```

- [ ] **Step 2: Reiniciar o dev server e conferir os cabeçalhos**

Run:
```bash
# (reiniciar o npm run dev antes)
curl -s -I http://localhost:3000/pt-BR | grep -iE "content-security|x-frame|x-content-type|referrer-policy|permissions-policy|x-powered"
```
Expected: aparecem `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`; e **não** aparece `X-Powered-By`.

- [ ] **Step 3: Confirmar que nada quebrou (o teste que importa)**

Abrir no navegador com o dev server rodando e verificar, no console (F12), que **não há erro de CSP** (mensagens "Refused to load/connect ... violates Content Security Policy"):
- Home `/pt-BR`: as imagens (Cloudinary) carregam.
- `/admin/editor` (logado): a prévia no iframe carrega e a edição funciona (o iframe é same-origin).
- Se o GA estiver configurado (`NEXT_PUBLIC_GA_MEASUREMENT_ID`): o script de `googletagmanager.com` carrega sem erro de CSP.

Se algum recurso for bloqueado, anotar o host/diretiva da mensagem de erro e acrescentá-lo à diretiva certa da CSP (ex.: um novo host de imagem entra em `img-src`), depois repetir o Step 2/3.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts
git commit -m "feat: cabecalhos de seguranca, avif e ocultar x-powered-by"
```

---

### Task 2: Imagem de compartilhamento (OpenGraph)

**Files:**
- Create: `src/app/[locale]/opengraph-image.tsx`
- Modify: `src/app/[locale]/layout.tsx` (remover a linha `metadataBase`? não — mantém; a OG image usa a rota relativa que o Next resolve)

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: uma imagem 1200×630 gerada pelo Next para o preview em redes/WhatsApp; o Next injeta as tags `og:image`/`twitter:image` automaticamente por o arquivo existir na pasta da rota.

- [ ] **Step 1: Criar a imagem OG**

Criar `src/app/[locale]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

// Tamanho padrão para preview em redes sociais / WhatsApp.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sami da Silva Studio";

/**
 * Imagem de compartilhamento gerada no build. Mantém a identidade do site
 * (fundo quente escuro + terracota + nome em serifada) sem depender de fonte
 * externa — a fonte do sistema é suficiente para um cartão social.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
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
          Visualização Arquitetônica
        </div>
        <div style={{ fontSize: 96, marginTop: 24, fontWeight: 700, lineHeight: 1.05 }}>
          Sami da Silva <span style={{ color: "#8a8178" }}>Studio</span>
        </div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#d8cdba" }}>
          From Blueprint to Reality
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Rodar o build ou dev e conferir que a rota responde**

Run (com `npm run dev` no ar):
```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://localhost:3000/pt-BR/opengraph-image"
```
Expected: `200 image/png`.

- [ ] **Step 3: Conferir a tag no HTML**

Run:
```bash
curl -s "http://localhost:3000/pt-BR" | grep -oE 'og:image[^>]*' | head -1
```
Expected: aparece uma meta `og:image` apontando para `/pt-BR/opengraph-image`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/opengraph-image.tsx"
git commit -m "feat: imagem de compartilhamento (opengraph) do site"
```

---

### Task 3: Alvos de toque no menu e no rodapé (mobile)

**Files:**
- Modify: `src/components/layout/navbar.tsx` (links do menu mobile)
- Modify: `src/components/layout/footer.tsx` (links de navegação, contato e idiomas)

**Interfaces:**
- Nenhuma nova — só classes de padding para os links empilhados ficarem com ~44px de área tocável.

- [ ] **Step 1: Aumentar a área tocável dos links do rodapé**

Em `src/components/layout/footer.tsx`, os links de navegação, contato e idiomas usam `text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]`. Em cada um desses `<Link>`/`<a>`, acrescentar `inline-block py-1` para dar altura de toque. Concretamente, trocar as três ocorrências da classe:

```tsx
className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
```

por:

```tsx
className="text-small inline-block py-1 text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
```

(São 3 blocos de `<li>` — navegação, contato/redes e idiomas. Todos recebem o mesmo `inline-block py-1`.)

- [ ] **Step 2: Aumentar a área tocável dos links do menu mobile**

Em `src/components/layout/navbar.tsx`, localizar a lista de links do **menu mobile** (o painel que abre no toque do ícone de menu — busca por `menuOpen` no JSX). Cada link do menu mobile deve ter pelo menos `py-3` (a maioria dos menus mobile já usa; se algum link do menu mobile tiver `py-2` ou menos, subir para `py-3`). Se o menu mobile já usa `py-3`+, nenhuma mudança é necessária aqui — registrar isso no relatório e seguir.

- [ ] **Step 3: Conferir no navegador (390px)**

Run (com dev no ar), medir os links do rodapé no mobile:
```bash
# script playwright: medir altura dos links do footer em 390px
```
Ou inspecionar manualmente em 390px: os links do rodapé e do menu mobile aberto devem ter ~40px+ de altura tocável (não ~20px).

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/navbar.tsx src/components/layout/footer.tsx
git commit -m "fix: area de toque maior nos links de nav e rodape no mobile"
```

---

### Task 4: Dependências vulneráveis (`npm audit`)

**Files:**
- Modify: `package.json` / `package-lock.json` (se houver update seguro)

**Interfaces:**
- Nenhuma de código.

- [ ] **Step 1: Ver o estado atual**

Run: `npm audit --omit=dev`
Expected atual: 2 vulnerabilidades moderadas (`postcss` transitivo, via `next`).

- [ ] **Step 2: Tentar atualizar o Next para a versão de patch mais recente**

Run:
```bash
npm install next@latest
npm audit --omit=dev
```
Expected: as moderadas somem **se** houver um Next mais novo que já traga o `postcss` corrigido.

- [ ] **Step 3: Se ainda restarem, confirmar que são transitivas e não exploráveis aqui**

Se `npm audit` ainda apontar as 2 moderadas mesmo no Next mais novo: **não** rodar `npm audit fix --force` (ele faz downgrade do Next e quebra o projeto). Registrar no relatório que são transitivas do `next`, moderadas, sem correção disponível sem breaking change, e serão resolvidas no próximo minor do Next. Isso satisfaz o RNF-27 (esforço razoável de manter atualizado; sem introduzir regressão).

- [ ] **Step 4: Rodar a verificação do projeto**

Run: `npm run typecheck && npm test`
Expected: tudo passa (garante que o eventual update do Next não quebrou nada).

- [ ] **Step 5: Commit (só se algo mudou)**

```bash
git add package.json package-lock.json
git commit -m "chore: atualiza next e corrige vulnerabilidades de dependencia"
```
(Se nada mudou por não haver patch, pular o commit e anotar no relatório.)

---

### Task 5: Documentar a limitação do rate limit

**Files:**
- Modify: `src/lib/auth/rate-limit.ts` (comentário já existe; reforçar) e `README.md`

**Interfaces:**
- Nenhuma de código — o rate limit em memória continua (é adequado ao tráfego atual). Só deixamos explícita a limitação e o caminho de evolução, para não ser um risco silencioso.

- [ ] **Step 1: Registrar a limitação no README**

Em `README.md`, na seção de deploy/produção (ou criar uma nota curta), acrescentar:

```markdown
### Rate limiting

A proteção contra abuso do login e do formulário de contato (`src/lib/auth/rate-limit.ts`)
é em memória, por instância. Em um deploy serverless com várias instâncias
(ex.: Vercel), o limite é aplicado por instância, não global — suficiente para o
tráfego atual, somado ao honeypot do formulário. Se o volume crescer, trocar por
uma solução distribuída (ex.: Upstash Redis) mantendo a mesma função
`assertRateLimit`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md src/lib/auth/rate-limit.ts
git commit -m "docs: registra limitacao do rate limit em memoria"
```

---

### Task 6: Checklist de verificação em produção (pós-deploy)

**Files:**
- Create/Modify: `README.md` (seção "Verificação pós-deploy")

**Interfaces:**
- Nenhuma de código. Estes RNFs (desempenho real, HTTPS, navegadores/dispositivos reais, uptime) só se confirmam com o site no ar — o entregável é um checklist para rodar após o deploy na Vercel.

- [ ] **Step 1: Adicionar o checklist ao README**

Em `README.md`, acrescentar:

```markdown
## Verificação pós-deploy (RNFs de produção)

Rodar depois de publicar na Vercel:

- [ ] **HTTPS (RNF-23):** o domínio abre em `https://` e redireciona `http→https` (automático na Vercel).
- [ ] **Desempenho (RNF-01):** Lighthouse mobile e desktop na home e no portfólio — LCP < 3s, sem regressão de score.
- [ ] **Navegadores (RNF-20):** abrir o site em Chrome, Edge, Firefox e Safari — layout e formulário ok.
- [ ] **Dispositivos (RNF-22):** abrir em um Android e um iPhone reais — navegação, 3D (ou fallback estático) e formulário ok.
- [ ] **Compartilhamento (RNF-31):** colar o link no WhatsApp/LinkedIn e ver o preview com título, descrição e a imagem OG.
- [ ] **Links quebrados (RNF-38):** navegar todas as páginas e checar que nenhuma imagem/rota dá 404.
- [ ] **Cabeçalhos (segurança):** `curl -I https://<dominio>` mostra CSP, X-Frame-Options, etc., e sem X-Powered-By.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: checklist de verificacao pos-deploy dos rnfs de producao"
```

---

## Notas de cobertura (auditoria → tasks)

- Headers de segurança + X-Powered-By → **Task 1**
- AVIF (RNF-02) → **Task 1**
- OG image (RNF-31) → **Task 2**
- Alvos de toque (RNF-09) → **Task 3**
- Dependências (RNF-27) → **Task 4**
- Rate limit (RNF-25, nota) → **Task 5**
- RNF-01, 20, 22, 23, 37, 38 (só em produção) → **Task 6** (checklist)

Os demais RNFs já foram verificados como atendidos na auditoria e não precisam de mudança.
