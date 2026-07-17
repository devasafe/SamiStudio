"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import type { BeforeAfterItem } from "@/models/project";

interface BeforeAfterProps {
  items: BeforeAfterItem[];
  labels: { before: string; after: string; hint: string };
}

/** Onde o divisor começa: no meio, mostrando os dois lados. */
const START = 50;

/**
 * Comparador de arrastar: a foto do depois é o fundo e a do antes é recortada
 * pelo divisor.
 *
 * O `clip-path` faz o corte sem recortar a imagem no servidor nem duplicar
 * requisição — as duas fotos carregam inteiras e o corte é só visual.
 */
export function BeforeAfter({ items, labels }: BeforeAfterProps) {
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(START);
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const moveTo = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, percent)));
  }, []);

  const item = items[active];
  if (!item) {
    return null;
  }

  return (
    <div>
      <div
        ref={frameRef}
        className="relative aspect-[16/9] w-full touch-none overflow-hidden select-none"
        onPointerDown={(event) => {
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) {
            moveTo(event.clientX);
          }
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
      >
        <Image src={item.after} alt={labels.after} fill sizes="100vw" className="object-cover" />

        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden
        >
          <Image
            src={item.before}
            alt={labels.before}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <span className="text-caption absolute top-4 left-4 rounded bg-[#141009]/80 px-3 py-1.5 tracking-[0.18em] text-[#f2ece0] uppercase">
          {labels.before}
        </span>
        <span className="text-caption absolute top-4 right-4 rounded bg-[#141009]/80 px-3 py-1.5 tracking-[0.18em] text-[#f2ece0] uppercase">
          {labels.after}
        </span>

        {/* Divisor + alça. O input abaixo é quem responde ao teclado. */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[#f2ece0]"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f2ece0] bg-[#141009]/60 backdrop-blur-sm">
            <ChevronLeft className="size-4 text-[#f2ece0]" aria-hidden />
            <ChevronRight className="size-4 text-[#f2ece0]" aria-hidden />
          </span>
        </div>

        <p className="text-caption pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[#f2ece0]/70">
          {labels.hint}
        </p>

        {/* O arrastar não existe para quem usa teclado: este range é a mesma
            função, e fica por cima da faixa inteira. */}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(position)}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={`${labels.hint} (${item.label ?? ""})`.trim()}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>

      {/* Tira dos pares: só quando há mais de um. */}
      {items.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {items.map((pair, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  setActive(index);
                  setPosition(START);
                }}
                aria-pressed={index === active}
                className={`relative block h-16 w-24 overflow-hidden rounded border transition-colors ${
                  index === active ? "border-[#cf5a18]" : "border-[#f2ece0]/15"
                }`}
              >
                <Image
                  src={pair.after}
                  alt={pair.label ?? `${labels.after} ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                {pair.label ? (
                  <span className="text-caption absolute inset-x-0 bottom-0 truncate bg-[#141009]/80 px-1 py-0.5 text-[#f2ece0]">
                    {pair.label}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
