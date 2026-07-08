# 16_GEOMETRY_NODES.md

# Geometry Nodes

Versão: 1.0

Projeto:
Blueprint Engine

---

# Objetivo

Criar um sistema procedural reutilizável.

O objetivo NÃO é gerar arquitetura.

O objetivo é controlar como o projeto nasce durante a navegação.

---

# Filosofia

Um único parâmetro controla toda a cena.

Progress

0.0

↓

1.0

Todo o restante responde automaticamente.

---

# Node Group

BlueprintBuilder

Entradas

Progress

BlueprintOpacity

GrowthSpeed

NoiseStrength

MaterialFade

LightIntensity

VegetationGrowth

---

# Saídas

Geometry

Materials

Attributes

Visibility

---

# Sistemas

Foundation

↓

Structure

↓

Walls

↓

Roof

↓

Windows

↓

Furniture

↓

Vegetation

---

# Foundation

Objetivo

Mostrar fundação.

Progress

0.00

↓

0.10

---

# Structure

Progress

0.10

↓

0.30

---

# Walls

Progress

0.30

↓

0.50

---

# Roof

Progress

0.50

↓

0.65

---

# Windows

Progress

0.65

↓

0.75

---

# Furniture

Progress

0.75

↓

0.90

---

# Vegetation

Progress

0.90

↓

1.00

---

# Blueprint

Estado inicial

Material branco.

Linhas.

Wireframe.

Pouca iluminação.

---

# Material Fade

Todos os materiais deverão aparecer gradualmente.

Nunca instantaneamente.

---

# Growth

Sempre utilizar animações orgânicas.

Jamais utilizar escalas bruscas.

---

# Noise

Pequena irregularidade.

Nunca parecer robótico.

---

# Lighting

A intensidade da iluminação acompanha o Progress.

Quanto maior o progresso

Maior a qualidade visual.

---

# Futuro

Interior.

Portas abrindo.

Janelas.

Água.

Piscina.

Dia.

Noite.

Weather.

---

# Organização

Cada Node deverá possuir comentários.

Grupos separados.

Inputs organizados.

Nomes padronizados.

---

# Regras

Nunca criar Nodes sem documentação.

Nunca misturar responsabilidades.

Sempre reutilizar Node Groups.

Toda lógica deverá ser modular.

---

# Objetivo Final

Receber apenas:

Progress

E transformar completamente a cena.