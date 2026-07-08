# 17_THREE_ARCHITECTURE.md

# Three.js Architecture

Versão: 1.0

Projeto:
Blueprint Engine

---

# Objetivo

Definir toda a arquitetura da aplicação Three.js.

A Blueprint Engine será independente do restante do website.

---

# Estrutura

src/

blueprint-engine/

assets/

core/

components/

hooks/

systems/

timeline/

materials/

shaders/

utils/

config/

---

# Core

Engine

Scene

Renderer

Clock

AssetManager

LoadingManager

PerformanceManager

---

# Components

BlueprintCanvas

BlueprintScene

BlueprintModel

BlueprintLights

BlueprintCamera

Environment

PostProcessing

LoadingScreen

---

# Hooks

useBlueprint

useScrollProgress

useTimeline

useAssets

usePerformance

useCamera

---

# Systems

CameraSystem

LightingSystem

AnimationSystem

MaterialSystem

ScrollSystem

PerformanceSystem

LODSystem

DebugSystem

---

# Timeline

Recebe

Progress

↓

Atualiza

Camera

↓

Materials

↓

Geometry

↓

Lighting

↓

Sections

---

# Fluxo

Scroll

↓

GSAP

↓

Progress

↓

Blueprint Engine

↓

Three.js

↓

Render

---

# Camera

Câmera cinematográfica.

Movimentos suaves.

Sem OrbitControls em produção.

---

# Lights

HDRI

Directional Light

Area Light

Ambient Light

Environment

---

# Materials

PBR

Physical Material

Instancing quando possível.

---

# Assets

GLB

HDRI

Textures

Fonts

Icons

---

# Loading

Suspense

Loading Screen

Asset Preload

Progress Bar

---

# Performance

Adaptive DPR

Frustum Culling

LOD

Lazy Loading

Instancing

Compressed Textures

Compressed Models

---

# GSAP

ScrollTrigger

Timeline

Scrub

Pin

Snap (quando necessário)

---

# Post Processing

Bloom muito discreto.

Tone Mapping

ACES

FXAA

Color Correction

Vignette extremamente leve.

---

# Mobile

Desabilitar efeitos pesados.

Diminuir DPR.

Reduzir resolução.

Reduzir pós-processamento.

---

# Debug

FPS

Draw Calls

Triangles

Memory

GPU Time

CPU Time

---

# Organização

Toda funcionalidade deverá existir em um System.

Nenhuma lógica deverá ficar diretamente dentro dos componentes React.

---

# Comunicação

React

↓

Hooks

↓

Systems

↓

Engine

↓

Three.js

Nunca inverter esta ordem.

---

# Objetivo Final

A Blueprint Engine deverá ser completamente desacoplada do website.

O website apenas informa:

Progress

Idioma

Tema

Projeto Hero

Todo o restante será responsabilidade da Engine.