# Maquete clay montando no scroll — design

**Data:** 2026-07-10
**Status:** aprovado pelo cliente (Asafe), pendente de implementação

## Objetivo

Depois de remover o Hero 3D (casa-diorama) por performance, reintroduzir uma
experiência 3D **mais leve**: uma maquete clay de móveis (estilo soft clay
render — Apple/Framer/ICG) que fica **fixa no canto direito** da viewport e
**se monta à medida que o usuário rola** pelas seções do meio da home.

## Comportamento

- A home volta ao **modo pinado**: viewport fixa, o scroll dirige o progresso (0→1).
- **Hero (1ª tela):** imagem estática atual, **sem 3D**.
- **Seções do meio** (Sobre, Serviços, Processo, Portfólio, FAQ): conteúdo entra
  pela **esquerda** (layout `left`), a **maquete fica fixa à direita**.
- **CTA (última):** a maquete faz fade out; tela livre para o call-to-action.
- **Montagem:** cada seção do meio acrescenta móvel(is) à maquete
  (sofá → mesa de centro → escrivaninha → sinuca → aparador → estante/plantas).
  Na FAQ a maquete está completa. Reaproveita o reveal escalonado da engine.
- **Mobile / reduced-motion:** sem 3D, página normal empilhada (mantém o mobile leve).

## Arquitetura

Reaproveita a `blueprint-engine` existente (intacta no disco; só o import fora
desconectado). Componentes tocados:

- **`home-experience.tsx`** — reescrito: modo pinado com 3D num container à
  direita (~50% largura em `lg`), seções à esquerda; 3D só entre a 1ª e a última.
- **`interior-model.tsx`** — troca `MODEL_URL` para a maquete; **remove
  wireframe/`EdgesGeometry`** (a maquete não tem narrativa de planta baixa);
  revela só nós `Furniture_*`.
- **`blueprint-camera.tsx`** — reenquadra para a maquete; mantém o `setViewOffset`
  que já empurra o modelo para a metade direita.
- **`timeline/phases.ts`** — `furniture` cobre a faixa das seções do meio;
  fade in após o hero, fade out antes do CTA.
- **`blueprint-canvas.tsx`** — `frameloop="demand"` + `invalidate()` no scroll/hover.

## Decisões de leveza (pedido explícito "mais leve")

1. **1 mesh por móvel:** no export, juntar cada coleção num único
   `Furniture_<Nome>` (~11 nós em vez de 94) → menos draw calls e reveal barato.
2. **Materiais flat:** os clay procedurais (noise) viram **Base Color sólido**
   (noise não exporta p/ GLB; clay flat + IBL da engine dá o mesmo visual).
   GLB sem texturas = arquivo minúsculo.
3. **Geometria enxuta:** aplicar Subdivision em nível baixo + Decimate; aplicar
   todos os modifiers antes de exportar. Alvo do GLB: **< 1 MB** (a casa tinha 2,67 MB).
4. **Draco** na exportação (decoder já auto-hospedado em `public/draco`).
5. **`frameloop="demand"`:** o canvas só re-renderiza quando o progresso muda —
   nada de loop contínuo com a cena parada.
6. **Sem `EdgesGeometry`:** elimina a geração de wireframe (cara em CPU/memória).
7. **Sombra barata:** `shadowMaterial` num plano + shadow map pequeno congelado
   após a montagem (`ShadowFreeze`). DPR `[1, 1.25]`. Só desktop, lazy após idle.

## Fora de escopo

- Poses de câmera por seção / rotação orbital (efeito escolhido foi montagem).
- Reintroduzir a foto real no finale (a narrativa "blueprint→reality" era da casa).

## Riscos

- Reintroduz o Three.js removido por performance. Mitigado pelas decisões acima;
  ainda assim a engine carrega nas telas do meio (desktop). Aceito pelo cliente.
