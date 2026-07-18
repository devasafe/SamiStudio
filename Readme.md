# Sami da Silva Studio

Website institucional premium para o estúdio Sami da Silva Studio, especializado em Visualização Arquitetônica, Modelagem 3D, Renderização Realista e soluções com Inteligência Artificial para arquitetos, designers de interiores e construtoras.

---

# Objetivo

Criar uma experiência digital premium que represente o processo de transformação de um projeto arquitetônico:

Blueprint → Construção → Render Final

O website deve transmitir tecnologia, precisão, confiança e qualidade através de uma experiência imersiva utilizando Three.js.

---

# Tecnologias

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- React Three Fiber
- Three.js
- GSAP
- Framer Motion (quando necessário)

## Backend

- Next.js API Routes (ou Express, conforme evolução do projeto)
- MongoDB Atlas
- Mongoose

## Uploads

- Cloudinary

## Deploy

- Vercel
- MongoDB Atlas

### Rate limiting

A proteção contra abuso do login e do formulário de contato (`src/lib/auth/rate-limit.ts`)
é em memória, por instância. Em um deploy serverless com várias instâncias
(ex.: Vercel), o limite é aplicado por instância, não global — suficiente para o
tráfego atual, somado ao honeypot do formulário. Se o volume crescer, trocar por
uma solução distribuída (ex.: Upstash Redis) mantendo a mesma função
`assertRateLimit`.

## Ferramentas

- Blender
- Blender MCP
- Git
- GitHub

---

# Estrutura do Projeto

/
├── Docs/
├── ADR/
├── Assets/
├── Research/
├── References/
├── public/
├── src/
└── README.md

---

# Documentação

Toda a documentação oficial está localizada na pasta:

Docs/

Ela contém desde a visão do produto até a arquitetura da Blueprint Engine.

Não implementar funcionalidades sem consultar a documentação.

---

# ADR

Todas as decisões arquiteturais estão documentadas em:

ADR/

Nunca alterar decisões sem criar uma nova ADR.

---

# Fluxo de Desenvolvimento

Cliente

↓

Planejamento

↓

Documentação

↓

Arquitetura

↓

Implementação

↓

Testes

↓

Deploy

---

# Stack

Next.js

TypeScript

TailwindCSS

React Three Fiber

Three.js

GSAP

MongoDB

Cloudinary

---

# Hero

O Hero será baseado em um projeto real fornecido pela Sami.

A experiência será controlada por scroll.

Blueprint

↓

Construção

↓

Render Final

---

# Painel Administrativo

O painel permitirá que a cliente gerencie:

- Projetos
- Serviços
- FAQ
- Depoimentos
- Traduções
- SEO
- Configurações

Sem necessidade de alterar código.

---

# Internacionalização

Idiomas

- Português
- Inglês
- Espanhol

Toda a aplicação deverá suportar i18n desde a primeira versão.

---

# Objetivos Técnicos

- Performance
- SEO
- Escalabilidade
- Reutilização
- Código limpo
- Componentização
- Acessibilidade

---

# Status

Planejamento

✅ Concluído

Desenvolvimento

⬜ Não iniciado

Deploy

⬜ Não iniciado

---

## Verificação pós-deploy (RNFs de produção)

Rodar depois de publicar na Vercel:

- [ ] **HTTPS (RNF-23):** o domínio abre em `https://` e redireciona `http→https` (automático na Vercel).
- [ ] **Desempenho (RNF-01):** Lighthouse mobile e desktop na home e no portfólio — LCP < 3s, sem regressão de score.
- [ ] **Navegadores (RNF-20):** abrir o site em Chrome, Edge, Firefox e Safari — layout e formulário ok.
- [ ] **Dispositivos (RNF-22):** abrir em um Android e um iPhone reais — navegação, 3D (ou fallback estático) e formulário ok.
- [ ] **Compartilhamento (RNF-31):** colar o link no WhatsApp/LinkedIn e ver o preview com título, descrição e a imagem OG.
- [ ] **`NEXT_PUBLIC_SITE_URL`:** confirmar que está setada no ambiente de produção — sem ela `metadataBase` cai para `http://localhost:3000` e a URL do `og:image` aponta pra localhost, quebrando o preview do link.
- [ ] **Links quebrados (RNF-38):** navegar todas as páginas e checar que nenhuma imagem/rota dá 404.
- [ ] **Cabeçalhos (segurança):** `curl -I https://<dominio>` mostra CSP, X-Frame-Options, etc., e sem X-Powered-By.

---

# Licença

Projeto proprietário desenvolvido para Sami da Silva Studio.