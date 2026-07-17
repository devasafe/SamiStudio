/** Um dia da série do gráfico. */
export interface DailyPoint {
  /** Chave estável AAAA-MM-DD (dia local). */
  date: string;
  /** Rótulo do eixo X ("16 jul"). */
  label: string;
  value: number;
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Chave do dia no fuso de quem lê, não em UTC.
 *
 * `toISOString()` converteria uma mensagem das 21h no Brasil (UTC-3) para o dia
 * seguinte — o gráfico mostraria um dia diferente do que aparece na própria
 * mensagem, e ninguém entenderia por quê.
 */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Agrupa datas por dia numa janela que termina hoje.
 *
 * Dias sem nada entram valendo zero: a lacuna é informação (não houve mensagem),
 * e omitir o dia distorceria o espaçamento do eixo.
 */
export function dailyCounts(isoDates: string[], days: number, today = new Date()): DailyPoint[] {
  const points: DailyPoint[] = [];
  const index = new Map<string, number>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const key = dayKey(date);
    index.set(key, points.length);
    points.push({ date: key, label: `${date.getDate()} ${MONTHS[date.getMonth()]}`, value: 0 });
  }

  for (const iso of isoDates) {
    const position = index.get(dayKey(new Date(iso)));
    if (position !== undefined) {
      points[position].value += 1;
    }
  }

  return points;
}
