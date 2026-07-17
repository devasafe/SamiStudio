# Traduzir FAQ, serviços, depoimentos e projetos no admin (3 idiomas)

Data: 2026-07-17

## Contexto

O site é trilíngue (pt-BR/en/es). Os textos "soltos" da interface já são editáveis nos três idiomas pelo editor visual (`text-fields.tsx`). Mas o conteúdo cadastrado por CRUD — **FAQ, serviços, depoimentos e projetos** — só é editável em português nos formulários do admin, embora:

- Os quatro models já tenham o campo `translations` (`Record<locale, {campos}>`).
- A validação (`faqCreateSchema`, etc.) já aceite `translations`.
- O site já leia a tradução quando existe (`lib/content.ts` usa `translated()` — cai no pt-BR se a tradução estiver vazia).

Ou seja, o backend inteiro já suporta tradução; falta só a UI de edição. Hoje uma pergunta de FAQ criada no admin aparece em português mesmo com o site em inglês/espanhol.

O usuário pediu o FAQ, mas as quatro entidades estão na mesma situação e compartilham o mesmo padrão — então o escopo é as quatro, com um componente reutilizável.

## Campos traduzíveis (o que o site exibe traduzido)

Só os campos que `lib/content.ts` de fato lê via `translated()`:

- **FAQ**: `question`, `answer`
- **Serviço**: `title`, `description`
- **Depoimento**: `text` (só; nome/cargo/empresa o site mostra sempre no original)
- **Projeto**: `title`, `description`

Outros campos de `translations` que existem no model mas o site não usa (ex.: `testimonial.translations.role`) ficam de fora — traduzir o que não aparece só confunde.

## Fora de escopo

- Tradução automática.
- Traduzir campos que o site não exibe traduzidos.
- Mudanças nos models, validação ou nas rotas da API (já aceitam `translations`).

## Design

### Componente reutilizável `TranslatableField`

Novo `src/components/admin/translatable-field.tsx`, client. Renderiza um rótulo e, abaixo, três campos empilhados rotulados **Português / English / Español** (mesma ordem e rótulos do editor visual). Só o português é obrigatório; en/es vazios são normais (o site cai no português).

```tsx
export type Lang = "pt-BR" | "en" | "es";

interface TranslatableFieldProps {
  label: string;
  multiline?: boolean;      // Textarea em vez de Input
  required?: boolean;       // aplica-se só ao pt-BR
  placeholder?: string;
  values: Record<Lang, string>;
  onChange: (lang: Lang, value: string) => void;
}
```

Cada sub-campo é o `Input`/`Textarea` já existentes, com um rótulo pequeno do idioma (`text-muted-foreground text-xs`). O placeholder dos campos en/es indica que, vazios, usam o texto em português.

### Estado das traduções nos forms

Cada form (`faq-form`, `service-form`, `testimonial-form`, `project-form`) ganha no state um objeto de traduções por idioma não-padrão:

```ts
type Translations = { en: Record<string, string>; es: Record<string, string> };
```

- Inicializado de `initial.translations` (edição) ou vazio (criação).
- Um setter `setTranslation(lang, field, value)`.
- Para cada campo traduzível, o `Input`/`Textarea` atual vira um `<TranslatableField>` cujo `values` é `{ "pt-BR": values[field], en: translations.en[field] ?? "", es: translations.es[field] ?? "" }` e cujo `onChange` roteia: `pt-BR` → o campo base já existente; `en`/`es` → `setTranslation`.
- No `payload`, inclui `translations`, removendo entradas vazias (um `{ en: {}, es: {} }` vira `undefined`) para não gravar tradução em branco — a leitura do site já ignora vazio, mas não sujar o banco é melhor.

### Carregar traduções na edição

As quatro páginas de edição (`.../[id]/page.tsx`) passam a incluir `translations` no `initial` que montam a partir do doc (hoje montam só os campos base). As páginas de criação (`.../novo` ou o form sem `id`) começam com traduções vazias.

### Organização

O `TranslatableField` concentra a UI dos três idiomas; cada form só monta os `values`/`onChange`. Como os quatro forms repetem o mesmo pequeno padrão de state (`translations` + `setTranslation` + montagem de `values`), um helper enxuto `useTranslations(initial)` em `translatable-field.tsx` pode devolver `{ translations, setTranslation, toPayload }` para evitar repetir a mesma lógica quatro vezes. Mantém cada form focado no seu conteúdo.

## Testes

- Não há suíte de componente React (vitest roda em `node`). A lógica pura que vale testar é `toPayload` do helper (limpar traduções vazias → `undefined`); adicionar um teste unitário para ela em `src/components/admin/translatable-field.test.ts` seguindo o padrão dos testes de `src/lib`.
- Verificação manual (skill `run`): criar/editar uma pergunta de FAQ preenchendo en/es, salvar, abrir o site em cada idioma e confirmar a tradução; deixar en/es vazios e confirmar que cai no português; repetir um caso em serviço, depoimento e projeto.
