/** Tamanho máximo de um número com DDI (E.164). */
const MAX_DIGITS = 15;
/** Menor número plausível com DDI: sem isso o link do WhatsApp erra a pessoa. */
const MIN_DIGITS_WITH_DDI = 10;

const BRAZIL = "55";

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara progressiva de telefone, tolerante a país.
 *
 * O formato brasileiro (o caso dominante aqui) ganha o desenho completo; para
 * os outros DDIs os dígitos são só agrupados de três em três. Sem uma base de
 * formatos por país, fingir que sabemos o desenho de cada um daria máscara
 * errada — e o site atende cliente de fora (o número da própria Sami é +51).
 */
export function formatPhone(value: string): string {
  const digits = phoneDigits(value).slice(0, MAX_DIGITS);
  if (!digits) {
    return "";
  }

  if (digits.startsWith(BRAZIL)) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    let out = `+${BRAZIL}`;
    if (ddd) {
      out += ` (${ddd}`;
      if (ddd.length === 2) {
        out += ")";
      }
    }
    if (rest) {
      // Celular tem 9 dígitos e quebra em 5-4; fixo tem 8 e quebra em 4-4.
      const split = rest.length > 8 ? 5 : 4;
      out += ` ${rest.slice(0, split)}`;
      if (rest.length > split) {
        out += `-${rest.slice(split)}`;
      }
    }
    return out;
  }

  const [ddi, ...groups] = [digits.slice(0, 2), ...(digits.slice(2).match(/.{1,3}/g) ?? [])];
  return `+${[ddi, ...groups].join(" ")}`.trimEnd();
}

/**
 * Link para conversar no WhatsApp. Devolve null quando o número não tem
 * dígitos suficientes para incluir o DDI: um link sem DDI abre conversa com
 * outra pessoa, e isso é pior do que não ter link.
 */
export function whatsappUrl(phone: string, text?: string): string | null {
  const digits = phoneDigits(phone);
  if (digits.length < MIN_DIGITS_WITH_DDI) {
    return null;
  }
  const url = `https://wa.me/${digits}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
