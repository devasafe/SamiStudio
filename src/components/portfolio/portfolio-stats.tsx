import { Container } from "@/components/layout/container";

interface PortfolioStatsProps {
  eyebrow: string;
  stats: Array<{ value: string; label: string }>;
}

/**
 * Faixa de números no fim da página Portfólio. Valores e rótulos vêm do
 * dicionário (`portfolioPage.stats`), então são editáveis nos três idiomas
 * pelo editor visual (clique em cada número em /admin/editor).
 */
export function PortfolioStats({ eyebrow, stats }: PortfolioStatsProps) {
  return (
    <section className="border-t border-[#f2ece0]/10 bg-[#141009] text-[#f2ece0]">
      <Container className="py-16 lg:py-20">
        <p
          className="text-caption tracking-[0.22em] text-[#f2ece0]/45 uppercase"
          data-cms="text:portfolioPage.statsEyebrow"
        >
          {eyebrow}
        </p>
        <dl className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-3 lg:divide-x lg:divide-[#f2ece0]/12">
          {stats.map((stat, index) => (
            <div key={stat.label} className="px-2 lg:px-6">
              <dt
                className="font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-none"
                data-cms={`text:portfolioPage.stats.${index}.value`}
              >
                {stat.value}
              </dt>
              <dd
                className="text-caption mt-2 tracking-[0.16em] text-[#f2ece0]/50 uppercase"
                data-cms={`text:portfolioPage.stats.${index}.label`}
              >
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
