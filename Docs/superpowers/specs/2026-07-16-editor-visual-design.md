# Editor visual de conteúdo — clicar na página para editar (2026-07-16)

## Objetivo

Dar à Sami (não técnica) uma forma óbvia de editar o site: **abrir o painel, ver o
site, clicar no texto ou na foto e editar ali**. Hoje ela precisaria usar duas
telas que ninguém entende:

- **Traduções**: 188 campos numa lista plana, com rótulos como `about › stats › 0 ›
  value` — ×3 idiomas = 564 caixas de texto.
- **Configurações**: ~28 campos empilhados sem agrupamento, misturando foto da
  Sami, números da bio, redes sociais e horário de atendimento.

Meta: a Sami nunca mais precisa abrir essas telas para o trabalho do dia a dia.

## Contexto atual

- **A camada editável já existe e funciona.** `getMergedDictionary`
  (`src/lib/dictionary.ts`) faz `deepMerge` dos overrides salvos em `Translation`
  por cima do JSON base. `PATCH /api/v1/translations` já grava e já chama
  `revalidatePath("/", "layout")`. Falta só a interface.
- **Site e admin são o mesmo app e a mesma origem** (`src/app/[locale]` e
  `src/app/admin`) → iframe same-origin, `postMessage` direto, sem CORS.
- **12 componentes** de seção renderizam texto visível (about, services, process,
  faq, cta, testimonials, footer, navbar, latest-section, portfolio-grid,
  contact-form, floating-whatsapp) + 5 páginas.
- `ImageField`/`ImageUploader` (admin) já sobem para o Cloudinary com recorte
  opcional — o editor **reusa**, não reimplementa.
- `uploadedImage` (Zod) só aceita URL do Cloudinary; `safeImageUrl` protege o
  `next/image` de dado inválido.
- O admin usa **texto PT direto** (sem i18n) — os componentes novos seguem isso.
- 6 textos se repetem no dicionário ("Portfólio" em 5 paths, "Contato" em 4…).

## Decisões

| Tema | Decisão |
|------|---------|
| Onde se edita | **Dentro do admin** (`/admin/editor`), não no site público |
| Escopo | **Textos + fotos das seções + dados de contato** (os 3 tipos abaixo) |
| Idiomas | **Os 3** (pt-BR/EN/ES), com seletor na barra do editor |
| Marcação | **Explícita e na mão**, atributo `data-cms` no elemento que já existe |
| Detecção automática | **Rejeitada** — os 6 textos repetidos ficam ambíguos e títulos partidos/concatenados não casam; falha em silêncio |
| Ativação | **Handshake por `postMessage`**, sem `?edit=1` lido no servidor |
| Telas antigas | **Configurações + Traduções fundem** em `/admin/ajustes` |

### Por que não ler a sessão no servidor

Ler `cookies()` ou `searchParams` numa página do site a torna **dinâmica** e mata o
cache de **todas** as páginas — o site inteiro fica mais lento para beneficiar
visitante nenhum. O modo de edição é ativado **no cliente**, por handshake.

### Segurança

A proteção real é a API: `PATCH /translations` e `PATCH /settings` **já exigem
sessão**. O overlay é pintura — se alguém o ativar, não salva nada. O `EditBridge`
ainda assim valida `event.origin === location.origin` **e** `event.source ===
window.parent` antes de responder.

## Arquitetura

```
/admin/editor  ──iframe──►  /pt-BR/(rota escolhida)
      │                            │
      │  cms:enable (handshake)    │  EditBridge (~30 linhas, sempre no layout)
      ├───────────────────────────►│  └─ só ao receber o handshake:
      │                            │     import dinâmico do overlay
      │  cms:select {ref,value}    │
      │◄───────────────────────────┤  overlay: contorna [data-cms], captura clique
      │                            │
      ├─ painel lateral: campo certo por tipo
      ├─ PATCH /translations | /settings  (api-client do admin, com sessão)
      │
      │  cms:patch {ref,value} → troca o texto no DOM na hora (otimista)
      └─ router.refresh() do iframe → conteúdo revalidado confirma
```

### Os três tipos de referência

Um atributo só, prefixo define a origem e o editor certo:

| Prefixo | Exemplo | Origem | Editor |
|---------|---------|--------|--------|
| `text:` | `data-cms="text:sections.about.title"` | dicionário (`Translation`) | input/textarea, por idioma |
| `set:` | `data-cms="set:email"` | `SiteSettings` | input (não tem idioma) |
| `img:` | `data-cms="img:aboutPhoto"` | `SiteSettings` | `ImageField` existente |

Marcação vai **no elemento que já existe** — nunca num wrapper novo (envelopar
quebra layout em flex/grid):

```tsx
<h2 data-cms="text:sections.about.title">{about.title}</h2>
```

Título partido ganha um `<span>` inline por pedaço (inline não quebra layout):

```tsx
<h1>
  <span data-cms="text:aboutPage.heroTitleLead">{page.heroTitleLead}</span>{" "}
  <span data-cms="text:aboutPage.heroTitleEmphasis" className="italic">
    {page.heroTitleEmphasis}
  </span>
</h1>
```

Listas usam índice: `data-cms="text:aboutPage.values.0.title"`.

## Componentes

| Arquivo | Papel |
|---------|-------|
| `src/components/cms/edit-bridge.tsx` | Client, no layout do site. Fica **inerte** até o handshake; então faz import dinâmico do overlay. Único custo público (~2 KB). |
| `src/components/cms/edit-overlay.tsx` | Carregado sob demanda **dentro do iframe**. Contorna `[data-cms]` no hover, captura o clique, avisa o parent, aplica patch otimista. |
| `src/app/admin/(painel)/editor/page.tsx` | A tela: barra (página + idioma), iframe, painel lateral. |
| `src/components/admin/editor/edit-panel.tsx` | Escolhe o campo pelo prefixo (`text:`/`set:`/`img:`) e salva. |
| `src/lib/cms/refs.ts` | Parse/serialize da referência; `getByPath`/`setByPath` no dicionário. |
| `src/app/admin/(painel)/ajustes/page.tsx` | Configurações + Traduções fundidas, em abas. |

## Fluxo de dados

1. `EditBridge` monta em todo carregamento do site e espera.
2. `/admin/editor` monta o iframe; **no `onLoad`** manda `cms:enable` (reenviado a
   cada navegação dentro do iframe — se a Sami clicar num link, o modo continua).
3. Overlay marca `[data-cms]`; clique → `cms:select {ref, value, rect}`.
4. Painel abre o campo certo. Salvar → `PATCH` pela rota correspondente.
5. Sucesso → `cms:patch` (DOM atualiza na hora) + `router.refresh()` no iframe.
6. `revalidatePath` (já existente nas rotas) confirma o conteúdo do servidor.

## O que o editor visual NÃO resolve (e por isso `/admin/ajustes` continua)

**Não se clica no que não está na tela.** Campo vazio não renderiza: hoje
`address` e `businessHours` estão vazios e os blocos de Localização/Horário
**não existem** na página de contato. Idem LinkedIn/Facebook/Behance no rodapé.
O editor muda o que existe; **criar o que falta é em Ajustes**.

Também ficam fora, por não terem representação visual:

- **SEO/meta** (13 campos) — o que aparece no Google.
- Textos alternativos de imagem e rótulos de acessibilidade.
- Textos montados na hora ("Oi, eu sou {primeiro nome}.") → marca-se só o pedaço
  fixo (`founderGreeting`); o nome vem de `founderName`.

### `/admin/ajustes` (abas)

| Aba | Conteúdo |
|-----|----------|
| Site | nome, logo, favicon, idioma padrão, analytics |
| Contato e redes | email, phone, whatsapp, address, locationNote, businessHours, instagram, linkedin, facebook, youtube, behance |
| SEO | os 13 campos de `meta`, por idioma |
| Textos avançados | o resto do dicionário sem representação visual, por idioma |

`/admin/configuracoes` e `/admin/traducoes` **saem do menu** e redirecionam para
`/admin/ajustes`. A nav fica: Dashboard · **Editar site** · Mensagens · Projetos ·
Categorias · Serviços · Depoimentos · FAQ · Ajustes.

## Tratamento de erro

- Falha ao salvar → painel mostra a mensagem da API e **mantém o texto digitado**
  (nunca perder o que ela escreveu); a prévia volta ao valor anterior.
- Handshake sem resposta (overlay não carregou) → o editor mostra "não foi possível
  ativar a edição nesta página" em vez de um iframe mudo.
- `ref` desconhecida no painel → erro explícito, não silêncio.
- Sessão expirada → `AdminApiError` 401 já tratado pelo `api-client`.

## Testes

1. **`data-cms` aponta para path existente** (o mais importante): varre os `.tsx`,
   extrai os `text:`, confere contra o dicionário. Um typo vira texto que não abre
   para editar — e ninguém descobre até a Sami tentar e desistir.
2. `getByPath`/`setByPath`: aninhado, índice de array, path inexistente.
3. `EditBridge` ignora mensagem de origem diferente e de source ≠ parent.
4. `PATCH /translations` e `/settings` sem sessão → 401 (rede de segurança).
5. Verificação manual: editar um texto em cada tipo (`text:`/`set:`/`img:`) e ver
   a mudança na prévia e no site.

## Fora de escopo

- Projetos, serviços, FAQ e depoimentos: já têm telas próprias que funcionam.
- Arrastar seções / reordenar layout.
- Histórico de versões e desfazer.
- Edição direto no texto da prévia (contenteditable) — o painel lateral acerta
  títulos de estilo misto sem brigar com o layout.
