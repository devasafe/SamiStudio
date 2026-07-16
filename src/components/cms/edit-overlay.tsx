"use client";

import { useEffect } from "react";
import { parseRef } from "@/lib/cms/refs";
import { isTrustedEditMessage, type CmsMessage } from "@/lib/cms/protocol";

/** Contorno do que é editável, injetado só no modo de edição. */
const STYLE = `
  [data-cms] {
    outline: 1px dashed rgba(207, 90, 24, 0.55);
    outline-offset: 2px;
    cursor: pointer;
    transition: outline-color 150ms;
  }
  [data-cms]:hover {
    outline: 2px solid #cf5a18;
    background: rgba(207, 90, 24, 0.08);
  }
`;

/**
 * Roda dentro do iframe: contorna os [data-cms], avisa o painel a cada clique
 * e aplica o valor novo na hora, para a prévia não esperar o servidor.
 */
export function EditOverlay() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const send = (message: CmsMessage) =>
      window.parent.postMessage(message, window.location.origin);

    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cms]");
      if (!target) {
        return;
      }
      // Impede o link/botão sob o texto de navegar durante a edição.
      event.preventDefault();
      event.stopPropagation();
      const ref = target.dataset.cms ?? "";
      send({
        type: "cms:select",
        ref,
        value: target.textContent?.trim() ?? "",
        // Mesmo endereço em vários pontos da página muda todos de uma vez:
        // o painel avisa antes.
        // Aspas simples no seletor (em vez de duplas) de propósito: o scanner
        // de marks.test.ts varre .tsx por atributo com aspas duplas para
        // validar as marcações reais; com aspas duplas aqui ele confundiria
        // este seletor dinâmico com uma marcação de verdade.
        count: document.querySelectorAll(`[data-cms='${ref}']`).length,
      });
    }

    function onMessage(event: MessageEvent) {
      if (!isTrustedEditMessage(event, window.location.origin, window.parent)) {
        return;
      }
      const data = event.data as CmsMessage;
      if (data.type !== "cms:patch") {
        return;
      }
      // Só `text:` tem o valor como texto na tela. Em `set:`, o elemento pode
      // ser um rótulo fixo ("Instagram") cujo valor é uma URL; em `img:`, é a
      // moldura da foto. Escrever o valor neles apagaria o conteúdo visível —
      // nesses casos o editor recarrega a prévia em vez de adivinhar.
      if (parseRef(data.ref)?.kind !== "text") {
        return;
      }
      document.querySelectorAll<HTMLElement>(`[data-cms='${data.ref}']`).forEach((element) => {
        element.textContent = data.value;
      });
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    send({ type: "cms:ready" });

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      style.remove();
    };
  }, []);

  return null;
}
