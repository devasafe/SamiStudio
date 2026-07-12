"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "@/components/icons";
import type { MasonryPhoto } from "@/types/project";

interface LightboxLabels {
  close: string;
  prev: string;
  next: string;
}

interface PhotoLightboxProps {
  photos: MasonryPhoto[];
  /** Índice aberto; `null` = fechado. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  labels: LightboxLabels;
}

/** Overlay full-screen com a foto ampliada; navegação por setas e teclado. */
export function PhotoLightbox({ photos, index, onClose, onNavigate, labels }: PhotoLightboxProps) {
  const isOpen = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (direction: number) => {
      if (index === null) {
        return;
      }
      onNavigate((index + direction + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        go(1);
      } else if (event.key === "ArrowLeft") {
        go(-1);
      } else if (event.key === "Tab") {
        // Trap de foco: mantém o Tab ciclando entre os botões do overlay.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, go]);

  // Foco inicial no botão fechar ao abrir; devolve o foco ao fechar.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (index === null) {
    return null;
  }
  const photo = photos[index];
  const iconButton =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" aria-hidden />
      </button>

      {photos.length > 1 ? (
        <button
          type="button"
          aria-label={labels.prev}
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
          className={`${iconButton} left-4`}
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
      ) : null}

      <div
        className="relative flex max-h-[86vh] max-w-[90vw] items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.alt}
          width={photo.width ?? 1600}
          height={photo.height ?? 1200}
          sizes="90vw"
          className="max-h-[86vh] w-auto object-contain"
          priority
        />
      </div>

      {photos.length > 1 ? (
        <button
          type="button"
          aria-label={labels.next}
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
          className={`${iconButton} right-4`}
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
