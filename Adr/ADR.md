# README.md

```
# Architecture Decision Records (ADR)

Este diretório contém todas as decisões arquiteturais do projeto Sami da Silva Studio.

Cada ADR representa uma decisão definitiva tomada durante o planejamento.

As ADRs não substituem a documentação da pasta Docs.

Elas registram apenas o motivo das decisões mais importantes.

Formato utilizado:

- Contexto
- Problema
- Decisão
- Consequências
- Status
```

---

# ADR-001 — Documentação como fonte da verdade

```
# ADR-001

## Título

A documentação será a fonte oficial da verdade.

---

## Contexto

O projeto possui dezenas de componentes, tecnologias e integrações.

Sem documentação consistente, decisões acabam sendo esquecidas durante o desenvolvimento.

---

## Decisão

Toda decisão deverá ser documentada antes da implementação.

A pasta Docs será considerada a documentação oficial do projeto.

---

## Consequências

Positivas

- Facilidade de manutenção
- Melhor contexto para IA
- Onboarding simples
- Menor retrabalho

Negativas

- Tempo inicial maior
```

---

# ADR-002 — Arquitetura Feature First

```
# ADR-002

## Título

Arquitetura baseada em Features.

---

## Contexto

Projetos organizados apenas por controllers, services e models tendem a crescer de forma desorganizada.

---

## Decisão

Toda a aplicação será organizada por Features.

Exemplo

Features

Portfolio

Services

Contact

Admin

Hero

Blueprint Engine

Cada feature possuirá seus próprios componentes, hooks, schemas e lógica.

---

## Consequências

Maior modularidade.

Maior escalabilidade.

Menor acoplamento.
```

---

# ADR-003 — Blueprint Engine desacoplada

```
# ADR-003

## Título

Blueprint Engine será um módulo independente.

---

## Contexto

O Hero é a principal experiência do website.

Misturar Three.js com componentes React aumenta o acoplamento.

---

## Decisão

Criar um módulo chamado Blueprint Engine.

Toda lógica relacionada ao Three.js ficará dentro dele.

O website apenas consome a Engine.

---

## Consequências

Código organizado.

Reutilização.

Maior facilidade de manutenção.
```

---

# ADR-004 — Scroll controla toda a experiência

```
# ADR-004

## Título

Scroll será o controlador principal da narrativa.

---

## Contexto

A experiência pretende representar a evolução de um projeto arquitetônico.

---

## Decisão

Todo o Hero será controlado pelo scroll.

Nenhuma animação importante ocorrerá automaticamente.

---

## Consequências

Maior sensação de controle.

Narrativa consistente.

Experiência memorável.
```

---

# ADR-005 — Blender como pipeline oficial

```
# ADR-005

## Título

Todos os modelos passarão pelo Blender.

---

## Contexto

Arquivos vindos do cliente possuem formatos diferentes.

---

## Decisão

Todo modelo será importado no Blender antes de chegar ao website.

O Blender será responsável por:

- organização
- otimização
- exportação GLB

---

## Consequências

Pipeline padronizado.

Melhor performance.

Facilidade de manutenção.
```

---

# ADR-006 — Multi-idioma nativo

```
# ADR-006

## Título

Internacionalização desde o início.

---

## Contexto

O site será publicado em:

Português

Inglês

Espanhol

---

## Decisão

Toda arquitetura será preparada para i18n desde a primeira versão.

Nenhum texto ficará fixo no código.

---

## Consequências

Sem retrabalho futuro.

Maior organização.
```

---

# ADR-007 — CMS obrigatório

```
# ADR-007

## Título

Todo conteúdo será administrável.

---

## Contexto

A cliente deseja editar textos e projetos.

---

## Decisão

Todo conteúdo ficará armazenado no banco.

Nenhum texto será hardcoded.

---

## Consequências

Maior autonomia para a cliente.
```

---

# ADR-008 — Performance acima dos efeitos

```
# ADR-008

## Título

Performance é prioridade.

---

## Contexto

O Hero utiliza Three.js.

---

## Decisão

Qualquer efeito visual poderá ser removido caso comprometa a experiência.

Meta:

60 FPS Desktop.

Boa experiência Mobile.

---

## Consequências

Website rápido.

Maior compatibilidade.
```

---

# ADR-009 — Deploy moderno

```
# ADR-009

## Título

Arquitetura Cloud Native.

---

## Decisão

Frontend

Vercel

Backend

Render

Banco

MongoDB Atlas

Uploads

Cloudinary

---

## Consequências

Escalabilidade.

Facilidade de deploy.
```

---

# ADR-010 — React não conversa diretamente com Three.js

```
# ADR-010

## Título

Three.js ficará encapsulado.

---

## Contexto

Misturar lógica React com lógica Three.js aumenta complexidade.

---

## Decisão

React conversa apenas com Blueprint Engine.

Blueprint Engine conversa com Three.js.

---

## Consequências

Baixo acoplamento.

Maior reutilização.
```

---

# ADR-011 — Hero baseado em projeto real

```
# ADR-011

## Título

O Hero utilizará um projeto real da Sami.

---

## Contexto

Queremos comunicar qualidade e autenticidade.

---

## Decisão

O Hero será baseado em um projeto fornecido pela cliente.

Não utilizar assets genéricos.

---

## Consequências

Experiência única.

Maior identidade visual.
```

---

# ADR-012 — Desenvolvimento guiado pela documentação

```
# ADR-012

## Título

Implementação somente após planejamento.

---

## Contexto

O projeto possui documentação extensa.

---

## Decisão

Nenhuma funcionalidade será implementada antes de existir documentação correspondente.

Fluxo oficial

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

## Consequências

Menos retrabalho.

Código consistente.

Maior previsibilidade.
```

---

# ADR-013 — Narrativa do Hero: interior reveal com projeto real

```
# ADR-013

## Título

O Hero contará a narrativa de um interior real sendo revelado, não a construção de uma casa.

---

## Contexto

O plano original (Docs 04, 14, 16 e 18) descrevia a narrativa do Hero como a
construção completa de uma casa: fundação → pilares → paredes → cobertura →
esquadrias → materiais → render final.

A Sami trabalha primariamente com renderização de INTERIORES.

Em 2026-07-09, cliente e desenvolvedor decidiram que o Hero deverá refletir
o trabalho real do estúdio.

---

## Decisão

A narrativa do Hero passa a ser um INTERIOR REVEAL baseado em um projeto real
de interiores da Sami:

1. O ambiente começa vazio, apenas em linhas técnicas (wireframe/blueprint).
2. Conforme o usuário rola, os elementos do render aparecem gradualmente
   (casca do ambiente → mobiliário → detalhes de decoração).
3. O estado final é o render hiper-realista com qualidade máxima
   (iluminação golden hour, materiais completos).

A timeline da Blueprint Engine fica re-mapeada para:

blueprint → shell → furniture → details → render

A arquitetura da Blueprint Engine NÃO muda: tudo continua controlado por um
único parâmetro progress (0.0 → 1.0), conforme ADR-003, ADR-004 e ADR-010.

---

## Consequências

Positivas

- Hero fiel ao serviço real do estúdio (reforça ADR-011)
- Modelo 3D final virá de um projeto de interiores da cliente
- Pipeline Blender (Docs/15) permanece válido sem alterações

Negativas

- As timelines de construção descritas nos Docs 04, 14, 16 e 18 ficam
  substituídas por esta ADR no que diz respeito às etapas da narrativa

## Status

Aprovada (2026-07-09)
```