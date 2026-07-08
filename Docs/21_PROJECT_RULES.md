# 21_PROJECT_RULES.md

# Project Rules

Versão: 1.0

Projeto:
Sami da Silva Studio

---

# Objetivo

Este documento define as regras obrigatórias do projeto.

Toda implementação deverá respeitar estas regras.

Nenhuma exceção.

---

# Filosofia

Performance acima de efeitos.

UX acima de tecnologia.

Arquitetura acima de velocidade.

Qualidade acima de quantidade.

---

# Código

Sempre utilizar:

TypeScript Strict

Nunca utilizar:

any

Nunca utilizar:

// @ts-ignore

---

# Componentes

Todo componente deve:

Ser reutilizável.

Ser desacoplado.

Possuir Props tipadas.

Possuir documentação.

Ser facilmente testável.

---

# Organização

Nunca criar arquivos grandes.

Máximo recomendado:

300 linhas.

Dividir responsabilidades.

---

# React

Preferir:

Server Components.

Utilizar Client Components apenas quando necessário.

---

# Estado

Priorizar:

Server State

↓

Context

↓

Local State

Evitar estados globais desnecessários.

---

# CSS

Utilizar apenas:

TailwindCSS

Nunca utilizar CSS inline.

Nunca utilizar valores aleatórios.

Utilizar Design Tokens.

---

# Responsividade

Desktop First.

Todo componente deve funcionar:

Desktop

Tablet

Mobile

---

# Performance

Lazy Loading.

Dynamic Import.

Tree Shaking.

Image Optimization.

Code Splitting.

---

# Hero

O Hero nunca poderá bloquear a navegação.

A experiência deverá ser fluida.

O Hero deverá degradar automaticamente em dispositivos fracos.

---

# Blueprint Engine

Nunca acessar diretamente Three.js.

Toda comunicação deverá ocorrer através da Engine.

---

# Componentes Three

Nunca colocar lógica de negócio dentro da cena.

Toda lógica deverá estar nos Systems.

---

# Backend

Toda rota deverá possuir:

Validação.

Tratamento de erro.

Logs.

Tipagem.

---

# Banco

Nunca apagar registros definitivamente.

Utilizar Soft Delete quando possível.

---

# Segurança

JWT.

Helmet.

Rate Limit.

Validation.

Sanitização.

---

# SEO

Toda página deverá possuir metadata.

Nunca publicar páginas sem SEO.

---

# Traduções

Todo texto deverá utilizar o sistema de internacionalização.

Nenhum texto poderá ficar fixo no código.

---

# Commits

Utilizar Conventional Commits.

feat:

fix:

refactor:

docs:

perf:

style:

test:

---

# Git

Nunca commitar:

.env

node_modules

uploads

cache

---

# Documentação

Toda funcionalidade nova deverá atualizar a documentação correspondente.

---

# Regra Principal

Quando existir dúvida entre duas soluções, escolher sempre a mais simples, modular e escalável.