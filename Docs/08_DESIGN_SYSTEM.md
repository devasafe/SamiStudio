# 08_DESIGN_SYSTEM.md

# Design System

Versão: 1.0

Projeto:
Sami da Silva Studio

---

# Objetivo

Este documento define todas as regras de UI do projeto.

Nenhum componente poderá fugir deste padrão.

Todo o website deverá parecer construído a partir de um único sistema.

---

# Filosofia

Minimalismo.

Arquitetura.

Respiração.

Precisão.

Elegância.

Poucos elementos.

Muito espaço.

Muito contraste.

Poucas cores.

---

# Grid

Desktop

12 Colunas

Container

1280px

Max Width

1440px

Gutter

32px

Margin

48px

---

Tablet

8 Colunas

---

Mobile

4 Colunas

---

# Breakpoints

Mobile

0 → 767

Tablet

768 → 1023

Desktop

1024 → 1439

Large Desktop

1440+

---

# Sistema de Espaçamento

Base:

8px

Escala

4

8

12

16

24

32

40

48

56

64

80

96

120

160

Nunca utilizar valores aleatórios.

---

# Radius

XS

4px

Small

8px

Medium

12px

Large

20px

XL

32px

Hero

40px

---

# Sombras

Shadow Small

Muito suave.

Shadow Medium

Suave.

Shadow Large

Apenas em modais.

Nunca utilizar sombras fortes.

---

# Tipografia

Heading

Playfair Display (serif — Manual da Marca, 2026-07-09)

Body

Inter

Code

JetBrains Mono

---

# Escala Tipográfica

Hero

72px

H1

56px

H2

48px

H3

36px

H4

28px

Body Large

20px

Body

18px

Small

16px

Caption

14px

---

# Peso

Light

300

Regular

400

Medium

500

SemiBold

600

Bold

700

---

# Paleta

Status:

✅ Oficial (Manual da Marca, 2026-07-09).

Primary (Terracota)

#CF5A18

Highlight (Magenta)

#B62B7A

Background (branco quente)

#F7F5F2

Surface

#FFFFFF

Border

#E7DFD4

Text Primary

#262626

Text Secondary

#6E6E6E

Wood

#B67D4B

Beige

#EAD9C6

Ivory

#FFF8F2

Success

#16A34A

Error

#DC2626

Warning

#F59E0B

---

# Botões

Primary

Background sólido.

Texto branco.

Hover discreto.

Radius Medium.

Padding 16x32.

---

Secondary

Outline.

Hover com leve preenchimento.

---

Ghost

Sem fundo.

Hover apenas alterando opacidade.

---

# Inputs

Altura

56px

Radius

12px

Padding

16px

Focus

Borda destacada.

Sem glow exagerado.

---

# Cards

Padding

32px

Radius

20px

Imagem grande.

Pouco texto.

Hover

Leve elevação.

Leve escala.

---

# Navbar

Altura

88px

Transparente no Hero.

Sólida após scroll.

Sempre fixa.

---

# Footer

Background escuro.

Muito espaçamento.

Links bem organizados.

---

# Ícones

Lucide React

Outline

2px Stroke

Mesmo tamanho em todo projeto.

---

# Motion

Duração

200ms

300ms

500ms

700ms

Curvas

Ease Out

Ease In Out

Nunca Bounce.

Nunca Elastic.

---

# Scroll

Smooth.

Sem exagero.

Sempre controlado.

---

# Hero

Elemento visual dominante.

Altura

100vh

Blueprint Engine

50% da tela.

Conteúdo

50%.

---

# Seções

Padding Vertical

120px

Desktop

80px

Tablet

64px

Mobile

---

# Imagens

Formato

WebP

Lazy Loading

Obrigatório.

---

# Vídeos

Autoplay

Muted

Loop

Compressed

---

# Componentização

Todo elemento visual deverá existir como componente reutilizável.

Nunca repetir código.

---

# Acessibilidade

Contraste AA.

Focus States.

ARIA Labels.

Keyboard Navigation.

---

# Responsividade

Desktop First.

Nunca esconder informações importantes.

Adaptar layout.

Nunca adaptar conteúdo.

---

# Performance

CSS mínimo.

Componentes reutilizáveis.

Code Splitting.

Tree Shaking.

Lazy Loading.

Suspense.

---

# Regra Principal

Todo componente deve parecer fazer parte do mesmo sistema.