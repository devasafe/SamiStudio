# 18_GSAP_TIMELINE.md

# GSAP Timeline

> **Nota (2026-07-09):** as etapas percentuais descritas aqui seguem a narrativa antiga de construção. A narrativa vigente é *interior reveal* (blueprint → shell → furniture → details → render) — ver **ADR-013**. O mecanismo (ScrollTrigger + pin + scrub + progress) permanece.

Versão: 1.0

Projeto:
Blueprint Engine

---

# Objetivo

Controlar toda a narrativa do Hero utilizando apenas uma Timeline.

A Timeline será sincronizada com o scroll.

O usuário controla a velocidade da experiência.

Todo o sistema responde apenas ao valor:

progress

0.0 → 1.0

---

# Fluxo

User Scroll

↓

ScrollTrigger

↓

GSAP Timeline

↓

Blueprint Progress

↓

Blueprint Engine

↓

Three.js

↓

Render

---

# Timeline

## 0%

Estado

Blueprint

Elementos

Linhas

Wireframe

Baixa iluminação

Texto Hero

Navbar transparente

Camera

Plano Geral

---

## 10%

Fundação

Aparecer

Foundation

Sombras suaves

Pequeno movimento da câmera

---

## 20%

Estrutura

Pilares

Vigas

Lajes

Camera aproxima lentamente.

---

## 35%

Paredes

Volumes

Primeiras sombras

Leve aumento da iluminação.

---

## 50%

Cobertura

Roof

Beirais

Detalhes externos.

---

## 65%

Esquadrias

Portas

Janelas

Vidros

Primeiros reflexos.

---

## 80%

Materiais

Madeira

Concreto

Metal

Pedra

Vidro

Todos aparecem suavemente.

---

## 90%

Mobiliário

Objetos internos

Decoração

Paisagismo

Detalhes

---

## 100%

Render Final

Pós-processamento

HDRI

Bloom

Color Correction

Hero Final

---

# Camera Timeline

Progress

0.00

Plano aberto.

↓

0.25

Leve aproximação.

↓

0.50

Ângulo cinematográfico.

↓

0.75

Mais próximo do projeto.

↓

1.00

Render Hero.

---

# Light Timeline

Progress

0%

Luz técnica.

↓

50%

Golden Hour.

↓

100%

Render completo.

---

# Material Timeline

Wireframe

↓

Clay

↓

PBR

↓

Render

---

# UI Timeline

Headline Fade

↓

Buttons Fade

↓

Sections Reveal

↓

Portfolio Reveal

↓

Footer

---

# ScrollTrigger

Pin Hero

Scrub

Ease None

Start

Top Top

End

+300%

---

# Performance

Nunca executar animações fora da viewport.

Nunca recalcular materiais desnecessariamente.

Atualizar apenas quando progress mudar.

---

# Futuro

Dia

Noite

Clima

Troca de materiais

Troca de projeto

Modo Wireframe

Modo Blueprint

Modo Render

---

# Objetivo Final

Toda animação deverá ser previsível, sincronizada e controlada exclusivamente pelo progresso da Timeline.