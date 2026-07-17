/** Menor número plausível com DDI: sem isso o link do WhatsApp erra a pessoa. */
const MIN_DIGITS_WITH_DDI = 10;

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
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
