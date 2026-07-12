# Portfólio — álbum de fotos em masonry (2026-07-12)

## Objetivo

Substituir a apresentação do portfólio por um **álbum de fotos em masonry** (colunas,
alturas variadas, coladas sem gaps) que acomode fotos de proporções diferentes sem
cortar nem deixar espaços. Vale para dois lugares, com o **mesmo componente**:

1. **`/portfolio`** — mosaico geral, uma capa por projeto; clicar leva ao projeto.
2. **`/portfolio/[slug]`** — galeria de fotos do projeto; clicar abre em lightbox.

## Contexto atual

- `/portfolio` usa `PortfolioGrid` → grid de `ProjectCard` (3 colunas) com filtro por
  categoria.
- `/portfolio/[slug]` mostra só a `coverImage` + metadados; a galeria é um placeholder
  (`galleryComingSoon`).
- **Schema Mongo já suporta**: `Project.gallery: GalleryItem[]` com
  `{ url, alt?, width?, height?, order? }` — as dimensões já existem, então dá pra
  evitar layout shift.
- `PortfolioItem` (tipo de exibição) hoje expõe só `coverImage`, não a `gallery`.
- `getProjectBySlug`/`getPublishedProjects` em `lib/content.ts` mapeiam a capa, não a
  galeria.

## Decisões

| Tema | Decisão |
|------|---------|
| Técnica de masonry | **CSS columns** (`columns-2/3/4` + `break-inside-avoid`), sem lib externa nem `grid masonry` (instável) |
| Espaçamento | **gap 0** — fotos coladas |
| Colunas | 2 (mobile) → 3 (≥sm) → 4 (≥lg) |
| Mosaico geral | **1 capa por projeto**; foto é `<Link>` para `/portfolio/[slug]` |
| Galeria do projeto | Todas as fotos da `gallery`; clique abre **lightbox** |
| Layout shift | `next/image` com `width`/`height` reais (fallback de proporção quando ausentes) |
| Ordem | Vertical por coluna (natural do CSS columns) — aceitável para galeria |

## Componentes

### `PhotoMasonry` (novo, `src/components/portfolio/photo-masonry.tsx`)

- **Props:** `photos: MasonryPhoto[]`, onde
  `MasonryPhoto = { url: string; alt: string; width?: number; height?: number; href?: string }`.
  Opcional `onPhotoClick?: (index) => void` para o modo lightbox.
- **Render:** contêiner `columns-2 sm:columns-3 lg:columns-4 gap-0`; cada item
  `break-inside-avoid`, imagem `block w-full h-auto`, sem margem.
- Se `href` presente → envolve em `next/link` (mosaico geral).
- Se `onPhotoClick` presente → `<button>` que dispara o índice (galeria).
- `next/image` com `sizes` responsivo; `loading="lazy"` fora da primeira dobra.
- Componente de **apresentação sem estado próprio**. É consumido por componentes que
  já são client — `PortfolioGrid` (já `use client`, tem o filtro) e `ProjectGallery`
  (client, controla o lightbox) — então não precisa declarar `use client` sozinho;
  onde há `onPhotoClick`, os handlers vêm do wrapper client.

### `PhotoLightbox` (novo, `src/components/portfolio/photo-lightbox.tsx`)

- Client component. Recebe `photos` e `index` aberto (ou `null` = fechado).
- Overlay full-screen escuro, imagem centralizada (`object-contain`), setas
  ‹ › e fechar (X). Navegação por teclado (Esc, ← →), trap de foco, `aria-modal`.
- Bloqueia scroll do body enquanto aberto.

### `ProjectGallery` (novo, client, `src/components/portfolio/project-gallery.tsx`)

- Envolve `PhotoMasonry` + `PhotoLightbox`; guarda o índice aberto no estado.
- Usado na página `[slug]`.

## Integrações

- **`portfolio-grid.tsx`**: mantém a barra de filtro por categoria; troca o grid de
  `ProjectCard` por `PhotoMasonry` alimentado com `{ url: coverImage, alt: title,
  href: /portfolio/slug }` dos projetos filtrados. Projetos sem `coverImage` usam um
  bloco placeholder (mantém `coverClass`).
- **`[slug]/page.tsx`**: onde hoje há a capa única + `galleryComingSoon`, renderiza
  `ProjectGallery` com a `gallery` do projeto. Se a galeria estiver vazia, mantém o
  fallback atual (capa + "galeria em breve").
- **`lib/content.ts`**: `getProjectBySlug` passa a expor `gallery: GalleryItem[]`
  (ordenada por `order`). `PortfolioItem` (ou um tipo `ProjectDetail`) ganha
  `gallery?: MasonryPhoto[]`.

## Responsividade e acessibilidade

- Colunas: 2 / 3 / 4 conforme breakpoint; imagens sempre `w-full`.
- Cada foto tem `alt` (da `gallery.alt` ou do título do projeto).
- Lightbox: `role="dialog"`, `aria-modal`, foco inicial no botão fechar, Esc fecha,
  ← → navegam, foco preso no overlay, retorno de foco ao elemento de origem.
- Textos do lightbox (aria-labels de fechar/anterior/próximo) via dicionário i18n
  (pt-BR/en/es) — nada hardcoded.

## Performance

- `next/image` com `width`/`height` das dimensões salvas → sem CLS.
- `sizes` coerente com as colunas (ex.: `(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw`).
- Lazy-load nativo; a primeira leva de imagens pode usar `priority` limitado.

## Testes

- Teste de unidade (`vitest`) do `PhotoMasonry`: renderiza N fotos, aplica
  `break-inside-avoid`, envolve em link quando há `href`.
- Teste do `PhotoLightbox`: abre no índice certo, navega com ← →, fecha com Esc.

## Fora de escopo

- **Cadastro de galeria no admin**: assume-se que `Project.gallery` é populada pelo
  CMS. Se o formulário de projeto ainda não permite subir múltiplas fotos com
  dimensões, isso é um trabalho separado (verificar em `admin/(painel)/projetos`).
- Reordenação drag-and-drop das fotos.
- Zoom/pan dentro do lightbox.
