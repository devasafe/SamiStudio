"use client";

import { MessageCircle } from "@/components/icons";
import { useDictionary } from "@/components/providers/language-provider";

interface FloatingWhatsAppProps {
  /** Número com DDI, apenas dígitos (ex.: 51999999999). */
  number: string;
}

/** Botão flutuante de WhatsApp (Docs/09) — canal principal de contato (Docs/01). */
export function FloatingWhatsApp({ number }: FloatingWhatsAppProps) {
  const dictionary = useDictionary();
  const digits = number.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={dictionary.common.whatsappCta}
      className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
