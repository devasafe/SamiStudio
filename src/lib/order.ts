/** Qualquer coisa ordenável por um campo `order` (fotos, serviços, ...). */
interface Ordered {
  order?: number;
}

/** Renumera `order` sequencialmente conforme a posição no array. */
export function reindex<T extends Ordered>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

/** Move o item de `from` para `to` e reindexa. Índices inválidos → sem efeito. */
export function moveItem<T extends Ordered>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return reindex(next);
}

/** Remove o item no índice e reindexa. */
export function removeItem<T extends Ordered>(items: T[], index: number): T[] {
  return reindex(items.filter((_, i) => i !== index));
}
