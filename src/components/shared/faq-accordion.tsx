"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FaqItem } from "@/lib/content";

interface FaqAccordionProps {
  items: FaqItem[];
}

/**
 * Lista de perguntas em acordeão, cada uma abrindo com uma transição suave de
 * altura. Cada item abre/fecha de forma independente (como o `details` que
 * havia antes). Acessível: cabeçalho é um botão com `aria-expanded`, e a
 * resposta é um `region` ligado a ele. Respeita "reduzir movimento".
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-16 border-t border-[#f2ece0]/10">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        return (
          <div key={item.question} className="border-b border-[#f2ece0]/10">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full cursor-pointer items-center gap-5 py-6 text-left"
              >
                <span
                  className={`text-caption w-8 shrink-0 transition-colors ${
                    isOpen ? "text-[#cf5a18]" : "text-[#f2ece0]/50"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-6 w-px shrink-0 bg-[#f2ece0]/15" aria-hidden />
                <span className="font-heading flex-1 text-lg leading-snug sm:text-xl">
                  {item.question}
                </span>
                <span
                  className="shrink-0 text-xl leading-none text-[#cf5a18] transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? undefined : { height: 0, opacity: 0 }}
                  animate={reduce ? undefined : { height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-small max-w-3xl pr-10 pb-6 pl-[3.25rem] leading-relaxed text-[#d8cdba]/75">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
