import type ptBR from "./dictionaries/pt-BR.json";
import type { Locale } from "./config";

export type Dictionary = typeof ptBR;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  "pt-BR": () => import("./dictionaries/pt-BR.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
