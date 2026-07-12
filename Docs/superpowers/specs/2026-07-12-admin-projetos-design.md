# Admin de projetos — lista com fotos, tela dedicada, galeria e checkpoint (2026-07-12)

## Objetivo

Reformar o admin de projetos para: (1) **listar** os projetos com **miniatura**;
(2) **criar/editar em tela dedicada** (não em modal); (3) enviar fotos **em
qualquer tamanho** (crop opcional); (4) **múltiplas fotos** com **reordenação por
arrastar**; (5) uma opção **checkpoint** que revela uploads de **Antes/Depois**.

## Contexto atual

- `/admin/projetos/page.tsx` usa o `CrudPage` genérico (tabela de texto + dois
  `Dialog` com `EntityForm`). É a "janelinha" a ser substituída — só para projetos;
  os outros CRUDs (categorias, serviços, faqs…) continuam no `CrudPage`.
- `ImageField` (`components/admin/image-field.tsx`) usa `react-easy-crop` (já
  instalado) e **força** o recorte na `aspect` recebida, enviando WebP para
  `/upload/image`. O crop é obrigatório.
- A rota `POST /api/v1/upload/image` já devolve `url`, `width`, `height`,
  `publicId` do Cloudinary (limite 10 MB; JPG/PNG/WebP/AVIF).
- Schema `Project` já tem `gallery: GalleryItem[]` (`{url, alt?, width?, height?,
  order?}`), `beforeImage?`, `afterImage?`, `coverImage?`.
- `projectCreateSchema`/`projectUpdateSchema` (Zod) já aceitam `gallery` (mesmo
  shape), `beforeImage`, `afterImage`. **Falta** apenas `checkpoint`.
- O admin usa **texto PT direto** (sem dicionários i18n) — os componentes novos
  seguem esse padrão.

## Decisões

| Tema | Decisão |
|------|---------|
| Navegação | Páginas dedicadas: `/admin/projetos` (lista), `/admin/projetos/novo`, `/admin/projetos/[id]` (editar) |
| Capa | **1ª foto da galeria = capa** (`coverImage` derivado no envio; sem campo separado) |
| Reordenação | **Arrastar** as miniaturas (drag-and-drop HTML5 nativo, sem lib nova) |
| Crop | **Envia original por padrão**; botão "Recortar" abre o cropper com proporção selecionável (Original/1:1/4:3/16:9) |
| Múltiplas fotos | `<input multiple>` → cada arquivo sobe original e vira um `GalleryItem` com `width`/`height` reais |
| Checkpoint | Novo campo `checkpoint: boolean`; quando marcado, mostra uploads Antes/Depois → `beforeImage`/`afterImage` |
| Backend | Galeria/antes/depois já aceitos; adicionar só `checkpoint` ao schema e à validação |

## Arquitetura

### Páginas (App Router, client)
- **`src/app/admin/(painel)/projetos/page.tsx`** → passa a renderizar `<ProjectList/>`
  (deixa de usar `CrudPage`).
- **`src/app/admin/(painel)/projetos/novo/page.tsx`** → `<ProjectFormPage/>` em modo
  criar.
- **`src/app/admin/(painel)/projetos/[id]/page.tsx`** → `<ProjectFormPage id={id}/>`
  em modo editar (carrega o projeto por id).

### Componentes (em `src/components/admin/projects/`)
- **`ProjectList`** — busca `GET /projects` (admin vê todos os status). Renderiza uma
  grade de cards: miniatura (`gallery[0]?.url` ou `coverImage`, `object-cover`,
  aspect 4/3, placeholder quando ausente), título, `cidade · ano`, badge de status,
  botões Editar (link) e Excluir (`DELETE`, com confirmação). Cabeçalho com título e
  botão "Novo projeto" (link para `/novo`).
- **`ProjectForm`** — formulário controlado com os campos de texto (título, slug,
  descrição, cliente, cidade, país, ano, categoria via `GET /categories`, destaque,
  status), o `GalleryUploader`, o checkbox **checkpoint** e, quando marcado, dois
  `ImageUploader` (Antes/Depois). Ao submeter: monta o payload, define
  `coverImage = gallery[0]?.url`, e chama `POST /projects` (criar) ou
  `PATCH /projects/{id}` (editar); ao concluir, redireciona para a lista.
- **`GalleryUploader`** — recebe `value: GalleryItem[]` e `onChange`. "Adicionar
  fotos" (`<input multiple>`); cada arquivo vai a `uploadImage()` (original) e vira
  `{ url, width, height, order }`. Grade de miniaturas reordenáveis por arrastar
  (atualiza `order`), cada uma com: remover, "Recortar" (abre `CropDialog`),
  e campo `alt` opcional.
- **`ImageUploader`** — imagem única com crop opcional (`value: string`, `onChange`).
  Envia original por padrão; botão "Recortar" abre `CropDialog`.
- **`CropDialog`** — extrai o recorte de `image-field.tsx`: `react-easy-crop` num
  `Dialog`, com seletor de proporção (Original/1:1/4:3/16:9), gera WebP e envia.
- **`uploadImage(file, { crop? }): Promise<{ url; width; height }>`** — helper em
  `src/components/admin/projects/upload.ts` que faz `POST /upload/image` e devolve a
  `MediaResponse`. Base única de upload para os componentes acima.

### Modelo / API
- **`src/models/project.ts`**: adicionar `checkpoint?: boolean` à interface e ao
  schema (`{ type: Boolean, default: false }`).
- **`src/lib/validation.ts`**: adicionar `checkpoint: z.boolean().optional()` ao
  `projectCreateSchema` (o update herda via `.partial()`).
- **`src/lib/content.ts`** / `PortfolioItem`: sem mudança nesta feature — a exibição
  do antes/depois no site é trabalho posterior.

## Fluxo de dados

1. Usuário adiciona fotos → cada uma sobe original → `GalleryItem[]` com dimensões.
2. Arrastar reordena → recalcula `order` sequencial.
3. (Opcional) "Recortar" numa foto → reenvia recortada, substitui a `url`/dimensões.
4. Marcar checkpoint → sobem Antes/Depois.
5. Submeter → `coverImage = gallery[0].url`; `POST`/`PATCH` com o payload validado.

## Acessibilidade / UX

- Miniaturas com `alt`; botões com rótulo textual.
- Reordenar por arrastar tem fallback: botões "◄"/"►" para mover a foto (teclado/mouse
  sem drag).
- Erros de upload/salvamento exibidos inline (padrão do `CrudPage` atual).
- Estados de carregando/enviando desabilitam os botões.

## Testes

- `uploadImage` e a derivação de `coverImage`/`order` são a lógica testável — extrair
  a normalização de galeria (recalcular `order`, mover item, definir capa) para um
  helper puro `normalizeGallery`/`moveItem` em `src/components/admin/projects/gallery-utils.ts`
  e cobrir com `vitest` (`*.test.ts`, node): reordenar, remover, capa = primeira.
- Componentes React verificados por `tsc`/`eslint`/`prettier` + smoke no dev
  (`/admin/projetos`, `/admin/projetos/novo`), como no restante do admin.

## Fora de escopo

- Exibir o **antes/depois no site público** (frontend) — trabalho seguinte.
- Upload por colar/arrastar arquivo da área de trabalho (só via seletor).
- Edição de vídeo, SEO e traduções na nova tela (mantêm o que já existe; esta tela
  foca em fotos/checkpoint). Se necessário depois, entram como incremento.
