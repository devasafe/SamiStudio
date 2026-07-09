# 14_BLUEPRINT_ENGINE.md

# Blueprint Engine

> **Nota (2026-07-09):** a timeline de construção (Foundation → ... → Vegetation) foi substituída pela narrativa de *interior reveal* (blueprint → shell → furniture → details → render). Ver **ADR-013**. A arquitetura da engine (progress 0→1) permanece inalterada.

Versão: 1.0

Projeto:
From Blueprint to Reality

---

# Objetivo

Blueprint Engine é uma engine responsável por transformar um modelo arquitetônico em uma experiência interativa baseada em scroll.

Ela não pertence apenas ao projeto Sami da Silva Studio.

Ela será desenvolvida como um módulo independente e reutilizável.

Seu objetivo é permitir que qualquer projeto arquitetônico possa ser apresentado através da narrativa:

Blueprint

↓

Construção

↓

Render Final

---

# Filosofia

O usuário não observa uma animação.

O usuário participa da construção.

O scroll representa o avanço da obra.

Cada movimento do usuário altera o estado da arquitetura.

---

# Arquitetura

Entrada

↓

Modelo Arquitetônico

↓

Blender

↓

Blueprint Engine

↓

GLB

↓

React Three Fiber

↓

GSAP

↓

Website

---

# Objetivos

Criar uma experiência memorável.

Valorizar o portfólio.

Demonstrar tecnologia.

Comunicar o processo da empresa.

Ser reutilizável.

---

# Entrada

A Blueprint Engine deverá aceitar:

SKP

FBX

OBJ

BLEND

GLB

GLTF

---

# Pipeline

Receber Modelo

↓

Importar Blender

↓

Organizar Collections

↓

Aplicar Blueprint Engine

↓

Criar Timeline

↓

Exportar GLB

↓

Three.js

↓

Website

---

# Collections

Todo projeto deverá possuir:

Foundation

Structure

Walls

Roof

Windows

Furniture

Decoration

Vegetation

Lighting

Environment

---

# Organização

Nenhum objeto poderá ficar fora de uma Collection.

Toda Collection deverá possuir um propósito.

---

# Timeline

0%

Blueprint

10%

Foundation

20%

Columns

35%

Walls

50%

Roof

65%

Windows

80%

Furniture

90%

Vegetation

100%

Render Final

---

# Blueprint

Estado inicial.

Somente linhas.

Pouca informação.

Aspecto técnico.

---

# Foundation

A fundação surge.

Concreto.

Estrutura inicial.

---

# Structure

Pilares.

Vigas.

Lajes.

---

# Walls

Volumes.

Paredes.

Divisórias.

---

# Roof

Cobertura.

Estrutura superior.

---

# Windows

Vidros.

Portas.

Esquadrias.

---

# Furniture

Mobília.

Decoração.

Detalhes.

---

# Vegetation

Paisagismo.

Plantas.

Elementos externos.

---

# Render Final

Modelo completo.

Iluminação.

Pós-processamento.

Imagem praticamente fotográfica.

---

# Camera

Movimentos cinematográficos.

Nunca rápidos.

Nunca bruscos.

Sempre suaves.

---

# Scroll

Todo movimento será controlado por GSAP.

Nenhuma animação automática.

---

# Blueprint Progress

Toda a engine será controlada por apenas um parâmetro.

progress

Valor

0.0

↓

1.0

Todos os sistemas deverão responder apenas a esse valor.

---

# React

Hero

↓

Blueprint Engine

↓

Canvas

↓

Scene

↓

Progress

↓

Timeline

↓

Sections

---

# Blender

Utilizar Blender MCP.

Todo processamento deverá ocorrer preferencialmente via automação.

---

# Geometry Nodes

Responsável por:

Construção.

Escala.

Aparição.

Transições.

Materiais.

---

# Assets

Modelo GLB

HDRI

Texturas

Materiais

Environment

---

# Renderização

React Three Fiber.

Three.js.

Post Processing.

HDRI.

ACES.

Tone Mapping.

---

# Performance

Meta:

60 FPS.

Desktop.

30~60 FPS.

Mobile.

---

# Limites

Modelo

Até 150 mil triângulos.

Texturas

2K.

GLB

Compactado.

---

# Mobile

Hero simplificado.

Menos partículas.

Menos pós-processamento.

Menor resolução.

---

# Estrutura

blueprint-engine/

assets/

materials/

timeline/

hooks/

components/

systems/

utils/

shaders/

---

# Sistemas

Camera System

Lighting System

Scroll System

Animation System

Material System

Loading System

Performance System

LOD System

---

# Futuro

Interior Walkthrough.

Mudança Dia/Noite.

Troca de Materiais.

Modo Blueprint.

Modo Render.

Modo Wireframe.

Integração BIM.

Realidade Aumentada.

---

# Objetivo Final

Blueprint Engine deverá se tornar um produto reutilizável.

Qualquer arquiteto poderá fornecer um modelo 3D.

A Engine será responsável por transformá-lo em uma experiência cinematográfica para web.

Este projeto é a primeira implementação dessa tecnologia.