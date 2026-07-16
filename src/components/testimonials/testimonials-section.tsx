import Image from "next/image";
import { Quote, Star } from "@/components/icons";
import { Container } from "@/components/layout/container";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { TestimonialItem } from "@/lib/content";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  dictionary: Dictionary;
  items: TestimonialItem[];
}

/**
 * Prova social entre o processo e o FAQ: depois de entender o método, ver
 * quem já passou por ele. Editorial dark, cartões em fio.
 *
 * Some por completo sem depoimentos cadastrados — melhor nenhuma seção do
 * que uma seção vazia (ou com elogio inventado).
 */
export function TestimonialsSection({ dictionary, items }: TestimonialsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const testimonials = dictionary.sections.testimonials;

  return (
    <section className="border-t border-[#f2ece0]/10 bg-[#141009] text-[#f2ece0]">
      <Container className="py-24 lg:py-28">
        <div className="text-center">
          <p className="text-caption inline-flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase">
            <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
            {testimonials.eyebrow}
          </p>
          <h2 className="font-heading mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-tight">
            {testimonials.title}
          </h2>
          <p className="text-small mx-auto mt-5 max-w-md leading-relaxed text-[#d8cdba]">
            {testimonials.subtitle}
          </p>
        </div>

        {/* Centralizado e com largura por cartão: fecha bonito com 1, 2 ou 6. */}
        <ul className="mt-16 flex flex-wrap justify-center gap-6">
          {items.map((item) => (
            <li
              key={`${item.name}-${item.text.slice(0, 24)}`}
              className="flex w-full max-w-sm flex-col border border-[#f2ece0]/10 p-8 sm:w-[22rem]"
            >
              <Quote className="size-7 shrink-0 text-[#cf5a18]/70" strokeWidth={1} aria-hidden />

              {item.rating ? <Rating value={item.rating} /> : null}

              <blockquote className="text-small mt-5 flex-1 leading-relaxed text-[#d8cdba]">
                {item.text}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4 border-t border-[#f2ece0]/10 pt-6">
                <Avatar name={item.name} photo={item.photo} />
                <div className="min-w-0">
                  <p className="text-caption truncate tracking-[0.14em] uppercase">{item.name}</p>
                  {item.role || item.company ? (
                    <p className="text-caption mt-1 truncate text-[#d8cdba]/55">
                      {[item.role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Nota em estrelas (as vazias ficam para dar a referência de 5). */
function Rating({ value }: { value: number }) {
  return (
    <p className="mt-5 flex gap-1" aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < value ? "fill-[#cf5a18] text-[#cf5a18]" : "text-[#f2ece0]/20"
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </p>
  );
}

/** Foto do cliente; sem foto cadastrada, as iniciais do nome. */
function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return (
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
        <Image src={photo} alt="" fill sizes="44px" className="object-cover" />
      </span>
    );
  }

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="text-caption flex size-11 shrink-0 items-center justify-center rounded-full border border-[#cf5a18]/40 text-[#cf5a18]"
      aria-hidden
    >
      {initials}
    </span>
  );
}
