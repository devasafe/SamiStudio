# 15_BLENDER_PIPELINE.md

# Blender Pipeline

Versão: 1.0

Projeto:
Blueprint Engine

---

# Objetivo

Este documento define todo o pipeline entre os arquivos enviados pelo cliente e o modelo utilizado pelo website.

Todo projeto deverá seguir exatamente este fluxo.

Nenhum modelo será utilizado diretamente no Three.js.

Todos deverão passar pelo Pipeline.

---

# Entrada

Arquivos aceitos

SKP

FBX

OBJ

BLEND

GLTF

GLB

---

# Pipeline

Receber Modelo

↓

Importar Blender

↓

Organizar Collections

↓

Limpeza

↓

Otimização

↓

Blueprint Engine

↓

Geometry Nodes

↓

Materiais

↓

Iluminação

↓

Exportar GLB

↓

Three.js

---

# Etapa 1

Importação

Objetivo

Importar corretamente o projeto.

Aplicar:

Rotation

Scale

Origin

Center

---

# Etapa 2

Organização

Criar Collections

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

Nenhum objeto poderá permanecer solto.

---

# Etapa 3

Limpeza

Remover

Objetos ocultos

Objetos duplicados

Materiais não utilizados

Coleções vazias

Texturas órfãs

Objetos quebrados

---

# Etapa 4

Padronização

Aplicar

Rotation

Scale

Transforms

Normals

Pivot

---

# Etapa 5

Materiais

Padronizar materiais.

Agrupar materiais repetidos.

Remover materiais inutilizados.

Converter texturas.

---

# Etapa 6

Blueprint Engine

Aplicar sistema procedural.

Adicionar Modifier.

Criar Node Group.

Criar parâmetro Progress.

---

# Etapa 7

Geometry Nodes

Criar

Blueprint Builder

↓

Receber Progress

↓

Animar

Foundation

↓

Walls

↓

Roof

↓

Furniture

↓

Vegetation

---

# Etapa 8

Iluminação

HDRI

Sun

Area Lights

Golden Hour

ACES

---

# Etapa 9

Performance

Meta

Menos de

150k triângulos

Texturas

Até 2K

Compressão

Draco

---

# Etapa 10

Exportação

Formato

GLB

Compressão

Draco

Texturas incorporadas

Transforms aplicados

---

# Estrutura

/blender

project.blend

hero.blend

materials.blend

lighting.blend

---

# MCP

Toda operação possível deverá ser executada pelo Blender MCP.

Objetivos

Importação

Organização

Renomeação

Collections

Exportação

Inspeção

O operador humano deverá apenas validar o resultado.

---

# Checklist

☐ Modelo importado

☐ Escala correta

☐ Centro correto

☐ Collections organizadas

☐ Materiais corretos

☐ HDRI

☐ Progress criado

☐ Exportação GLB

☐ Performance validada

☐ Hero funcionando