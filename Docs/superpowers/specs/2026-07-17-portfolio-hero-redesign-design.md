# Reforma da página Portfólio: banner de destaques + grade mesclada + faixa de números

Data: 2026-07-17

## Contexto

A página `/portfolio` hoje é só um hero de texto (título + parágrafo) seguido do mosaico de projetos com filtro por categoria (`src/components/portfolio/portfolio-grid.tsx`). O Asafe trouxe uma referência visual (mockup) com três elementos novos:

1. Um banner de hero em tela cheia com foto grande, card "DESTAQUE" sobreposto (projeto real) e setas de carrossel.
2. A mesma grade de projetos, mas com filtro em lista vertical à esquerda em vez de abas horizontais, e selo de categoria sobreposto na própria foto.
3. Uma faixa de 5 números no rodapé da página ("Números que refletem nossa jornada").

O pedido original era só "editar o banner da hero no admin"; nas perguntas de esclarecimento o escopo foi confirmado como as três partes acima, com uma decisão importante: **o banner não é uma imagem avulsa enviada à mão** — ele reaproveita o campo `featured` que já existe no modelo `Project` (`src/models/project.ts:49`) e no formulário de projeto do admin (`src/components/admin/projects/project-form.tsx:260-267`), hoje marcado mas não consumido em lugar nenhum do site. "Editar o banner" passa a significar marcar/desmarcar quais projetos aparecem no carrossel, direto na tela de Projetos que já existe.

A grade não vira cartões uniformes de 4 colunas como no mockup — o Asafe pediu para **mesclar** com o mosaico atual (alturas variadas), porque as fotos dos projetos têm tamanhos diferentes.

## Fora de escopo

- Reordenação manual dos projetos em destaque (usa `createdAt` desc, mesma ordem já usada pela rota `/api/v1/projects/featured`).
- Qualquer mudança na Home (o `heroProject` de `SiteSettings` e a experiência 3D da home não são tocados).
- Uma tela nova no admin: nada disso precisa de UI dedicada além do checkbox que já existe e do editor visual (`/admin/editor`) que já existe.

## Design

### 1. Banner de hero (carrossel de destaques)

Novo componente client `src/components/portfolio/portfolio-hero.tsx`, recebendo a lista de projetos em destaque já resolvida no server (`PortfolioItem[]`).

- Nova função `getFeaturedProjects(locale, dictionary)` em `src/lib/content.ts`, no mesmo padrão de `getPublishedProjects`: busca `Project.find({ status: "published", featured: true, deletedAt: null }).sort({ createdAt: -1 })`, populando `categoryId` para o nome da categoria, reaproveitando `toPortfolioItem`.
  - Fallback em cascata: sem nenhum projeto marcado como destaque → os 3 projetos publicados mais recentes (mesmo se não marcados) chamando `getPublishedProjects` e fatiando; sem nenhum projeto publicado no banco → `placeholderItems(dictionary)` fatiado, mesmo padrão de fallback já usado no resto do site.
- Estado local (`useState<number>` do índice atual) controla qual item do array aparece; as setas ‹ › avançam/voltam com wrap (do último volta pro primeiro). Sem setas quando só há 1 item.
- Cada slide mostra: foto de capa do projeto (`coverImage`, `fill` + `object-cover`), card sobreposto no canto inferior direito com selo "DESTAQUE" + título do projeto + `categoryLabel · city · year` + link "Ver projeto" apontando para `/portfolio/[slug]`.
- Bloco de texto à esquerda (eyebrow "Portfólio", título "Projetos que ganham *vida.*", parágrafo) continua vindo do dicionário `portfolioPage` como hoje — já bate com a referência, não muda.
- "Ver todos os projetos" vira um link-âncora (`href="#grade"`) que rola até a seção da grade, mesmo padrão do `FOUNDER_ANCHOR` em `src/app/[locale]/sobre/page.tsx:19`.
- Novas chaves em `portfolioPage` no dicionário (pt-BR/en/es): `heroCta` ("Ver todos os projetos"), `featuredBadge` ("Destaque"), `featuredCta` ("Ver projeto").
- Ajuste de cópia em `project-form.tsx`: o label do checkbox `featured` ganha uma linha de ajuda ("Aparece no carrossel do banner da página Portfólio") deixando explícito o efeito no site.

### 2. Grade + filtro (mosaico mesclado com o visual de referência)

`src/components/portfolio/portfolio-grid.tsx` continua com o mosaico em colunas CSS (`columns-2 lg:columns-3`, `break-inside-avoid`, array `ASPECTS` de alturas alternadas) — isso não muda, porque as fotos têm proporções diferentes entre si.

O que muda:

- **Filtro em coluna vertical fixa à esquerda no desktop** (`lg:` grid de duas colunas: filtro ~14rem + mosaico no restante), abas empilhadas verticalmente em vez de horizontais. No mobile/tablet (abaixo de `lg:`) continua horizontal como hoje — não há largura para uma coluna lateral.
- **Selo de categoria sobreposto na foto**: pill escura semi-transparente no canto superior esquerdo de cada `ProjectCard` (ex.: "Residencial"), além do texto de categoria que já aparece embaixo da foto — reforça o visual da referência sem remover informação existente.
- Ordenação (`sort`), paginação (`PAGE_SIZE = 9`, `PagerButton`) e o resto do comportamento atual não mudam.
- A seção recebe `id="grade"` para ser o alvo do link-âncora do banner.

### 3. Faixa de números

Novo componente `src/components/portfolio/portfolio-stats.tsx`, seguindo o mesmo padrão de `stat1..3` já usado em `about-section.tsx`/`sobre/page.tsx`: editável clicando direto na página via `/admin/editor` (atributo `data-cms="set:portfolioStatNValue"` / `"set:portfolioStatNLabel"`), sem tela nova no admin.

- `src/models/site-settings.ts`: +10 campos `String` (`portfolioStat1Value`..`portfolioStat5Value`, `portfolioStat1Label`..`portfolioStat5Label`).
- `src/lib/validation.ts`: mesmos 10 campos como `.optional()` no schema de settings.
- Fallback no dicionário quando o campo estiver vazio (mesmo `pick()` já usado): eyebrow "Números que refletem nossa jornada" + 5 pares padrão — "48 / Projetos realizados", "23 / Clientes atendidos", "6 / Anos de experiência", "12 / Estados atendidos", "98% / Clientes satisfeitos" (os mesmos números do mockup, como texto inicial editável).

### 4. Montagem da página

`src/app/[locale]/portfolio/page.tsx` passa a buscar `getFeaturedProjects` além de `getPublishedProjects`, e a compor `<PortfolioHero />` → `<PortfolioGrid id="grade" />` → `<PortfolioStats />` → `<CTASection />` (a CTA final de contato já existente continua no fim).

## Testes

- `src/lib/content.ts` já tem padrão de funções cacheadas testáveis por integração indireta (via páginas); não há suíte de unidade dedicada a `content.ts` hoje — mantém o padrão existente, sem adicionar teste isolado novo além do que já roda (`npm test`) cobrindo `lib/cms/*`.
- Verificação manual (skill `run`/`verify`) após a implementação: página `/portfolio` com 0, 1 e múltiplos projetos em destaque (fallback em cascata), navegação das setas do carrossel, clique nos números no `/admin/editor` para confirmar o `data-cms` funcionando, e o checkbox "Projeto em destaque" no admin refletindo no carrossel.
