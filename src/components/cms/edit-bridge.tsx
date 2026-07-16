"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTrustedEditMessage } from "@/lib/cms/protocol";

/**
 * Carregado só depois do handshake: o site público não paga o overlay.
 */
const EditOverlay = dynamic(() => import("./edit-overlay").then((m) => m.EditOverlay), {
  ssr: false,
});

/**
 * Ponte do modo de edição. Fica inerte no site público: só liga quando o
 * painel, na mesma origem e como janela-mãe, manda o handshake.
 *
 * Não lê cookie nem query no servidor de propósito — isso tornaria todas as
 * páginas dinâmicas e mataria o cache do site para beneficiar visitante nenhum.
 */
export function EditBridge() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Fora de um iframe não há editor nenhum para conversar.
    if (window.parent === window) {
      return;
    }

    function onMessage(event: MessageEvent) {
      if (!isTrustedEditMessage(event, window.location.origin, window.parent)) {
        return;
      }
      if ((event.data as { type: string }).type === "cms:enable") {
        setEnabled(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return enabled ? <EditOverlay /> : null;
}
