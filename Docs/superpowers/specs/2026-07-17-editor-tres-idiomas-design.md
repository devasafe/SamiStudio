# Painel do editor visual com os 3 idiomas de uma vez

Data: 2026-07-17

## Contexto

No editor visual (`/admin/editor`), ao clicar num texto da prévia, o painel lateral (`src/components/admin/editor/edit-panel.tsx`) abre com **um** campo, que edita o texto **apenas no idioma que a prévia está mostrando** (controlado pelo seletor de idioma no topo do editor). Para traduzir o mesmo texto nos três idiomas, hoje é preciso: editar, trocar o seletor de idioma, esperar a prévia recarregar, clicar de novo no texto, editar outra vez — três vezes.

A ideia (do Asafe) é abrir os **três campos de idioma de uma vez** (Português / English / Español) quando se clica num texto, com um botão único que salva os três. Isso elimina a troca de idioma repetida.

O site é trilíngue por decisão de projeto (pt-BR/en/es), com os textos padrão nos dicionários JSON (`src/i18n/dictionaries/{pt-BR,en,es}.json`) e os overrides editados no painel guardados por idioma na collection `Translation` (um documento por locale, campo `content` com a árvore de overrides). A rota `PATCH /api/v1/translations` recebe `{ locale, content }` e substitui o `content` inteiro daquele locale; o `GET` sem `locale` devolve todos os documentos.

## Escopo

- **Só textos** (`data-cms="text:..."`). Dados de contato (`set:`, ex.: telefone) e fotos (`img:`) **não mudam** — são globais ao site, não têm tradução, e continuam com campo único como hoje.
- O seletor de idioma no topo do editor **continua existindo**, mas seu papel passa a ser só escolher em qual idioma a **prévia** aparece. A edição de texto é sempre nos três.

## Fora de escopo

- Tradução automática / sugestão de tradução.
- Qualquer mudança no comportamento de `set:` e `img:`.
- Mudança na rota da API (o `PATCH` por locale já atende; salvar os três é três chamadas).

## Design

### Comportamento

Ao clicar num texto, o painel mostra três campos empilhados, rotulados **Português**, **English**, **Español** (mesma ordem e rótulos do seletor do topo, `LOCALES` em `editor/page.tsx`), cada um pré-preenchido com o override salvo daquele idioma. Campo sem override fica vazio, exibindo o **texto padrão daquele idioma** (do dicionário) como `placeholder` cinza — assim a pessoa sabe o que aparece no site se deixar em branco. Um botão **"Salvar"** grava os três.

Campo salvo vazio volta ao padrão: remove o override (via `deleteByPath`), em vez de gravar `""` — exatamente a regra que o painel já aplica hoje para um idioma só (ver comentários em `edit-panel.tsx` e `refs.ts:deleteByPath`).

### Carregar

Ao selecionar um texto, o painel busca os overrides dos três idiomas de uma vez com `GET /api/v1/translations` (sem `locale`, devolve todos os documentos), e lê o valor de cada um por `getByPath(doc.content, ref.path)`. Os textos padrão de cada idioma vêm dos três dicionários JSON, importados estaticamente no componente (`import ptBR from "@/i18n/dictionaries/pt-BR.json"`, idem en/es) e lidos por `getByPath(dict, ref.path)`. A guarda `ignore` contra corrida de seleção (clicar em A e depois B antes de A responder) que já existe no `edit-panel` é preservada.

### Salvar

Para cada um dos três locales, parte-se do `content` salvo daquele locale (buscado no carregar ou re-buscado no salvar, seguindo o padrão atual de partir do salvo para não apagar os outros overrides do idioma), aplica-se `setByPath` (campo preenchido) ou `deleteByPath` (campo vazio → volta ao padrão) no caminho do texto, e faz-se `PATCH /api/v1/translations` com `{ locale, content }`. Três PATCHes, um por idioma. A rota já revalida o site (`revalidatePath("/", "layout")`) a cada chamada.

### Prévia

Depois de salvar, a prévia reflete a mudança **no idioma que ela está mostrando** (o `locale` do editor). O painel avisa a prévia como hoje: patch otimista (`cms:patch`) para o texto do idioma atual quando o valor daquele idioma não é vazio; recarrega a prévia quando o idioma atual voltou ao padrão (valor vazio) — mesma lógica de `editor/page.tsx:onSaved`. Os outros dois idiomas não estão visíveis na prévia, então não precisam de atualização imediata.

### Organização do código

Hoje `edit-panel.tsx` concentra buscar/salvar de texto, de configuração (`set`) e de foto (`img`) num arquivo só. Com três campos de texto, a parte de texto cresce. Extrair a edição de texto para um componente próprio, `src/components/admin/editor/text-fields.tsx`, que recebe o `path` do texto, o `locale` atual da prévia e o callback de "salvo", e cuida de carregar/salvar os três idiomas. O `edit-panel.tsx` continua roteando por `kind`: renderiza `<TextFields>` para `text`, e mantém `ImageField`/`Input` para `img`/`set` como está. Isso mantém cada arquivo com uma responsabilidade clara e não toca no comportamento de `set`/`img`.

## Testes

- Não há suíte de componente React no projeto (vitest roda em `node`, testando lógica pura em `src/lib/**`). A lógica reutilizada (`getByPath`, `setByPath`, `deleteByPath`, `parseRef`) já tem testes em `src/lib/cms/refs.test.ts`; nenhuma lógica pura nova é introduzida (o componente só orquestra chamadas já testadas).
- Verificação manual (skill `run`): no `/admin/editor`, clicar num texto, confirmar que os três campos abrem preenchidos/placeholder corretos, editar os três, salvar, trocar o idioma da prévia e confirmar cada tradução no ar; editar só um idioma e salvar; esvaziar um idioma e confirmar que volta ao texto padrão.
