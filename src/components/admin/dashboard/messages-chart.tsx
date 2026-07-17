"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/dashboard/series";

interface MessagesChartProps {
  points: DailyPoint[];
}

/** Coordenadas do desenho; o SVG escala sozinho pelo viewBox. */
const VIEW = { width: 640, height: 200 };
/** A base reserva a faixa do eixo X — sem isso os rótulos ficariam cortados. */
const PAD = { top: 16, right: 44, bottom: 28, left: 32 };

const PLOT_W = VIEW.width - PAD.left - PAD.right;
const PLOT_H = VIEW.height - PAD.top - PAD.bottom;

/** Teto do eixo Y em número redondo, com piso 1 para não dividir por zero. */
function axisMax(points: DailyPoint[]): number {
  const highest = Math.max(1, ...points.map((point) => point.value));
  if (highest <= 4) {
    return highest;
  }
  return Math.ceil(highest / 5) * 5;
}

/**
 * Mensagens por dia — série única, então sem legenda: o título já diz o que é.
 *
 * Feito em SVG à mão de propósito: uma biblioteca de gráficos custaria centenas
 * de KB no painel para desenhar sete pontos e uma linha.
 */
export function MessagesChart({ points }: MessagesChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const maxValue = axisMax(points);
  const x = (index: number) =>
    points.length > 1 ? PAD.left + (PLOT_W * index) / (points.length - 1) : PAD.left + PLOT_W / 2;
  const y = (value: number) => PAD.top + PLOT_H - (PLOT_H * value) / maxValue;

  const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const area = `${PAD.left},${y(0)} ${line} ${x(points.length - 1)},${y(0)}`;
  const last = points[points.length - 1];
  const ticks = [0, maxValue];
  const active = hover === null ? null : points[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full"
        role="img"
        aria-label="Mensagens recebidas por dia nos últimos 7 dias"
        onPointerLeave={() => setHover(null)}
      >
        {/* Grade: hairline sólida, um passo do fundo — nunca tracejada. */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + PLOT_W}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Vinco do dia sob o ponteiro: o leitor mira no dia, não na linha. */}
        {active ? (
          <line
            x1={x(hover!)}
            x2={x(hover!)}
            y1={PAD.top}
            y2={PAD.top + PLOT_H}
            className="stroke-border"
            strokeWidth={1}
          />
        ) : null}

        <polygon points={area} className="fill-primary" opacity={0.1} />
        <polyline
          points={line}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={point.date}
            cx={x(index)}
            cy={y(point.value)}
            r={index === hover ? 5 : 4}
            className="fill-primary stroke-background"
            strokeWidth={2}
          />
        ))}

        {/* Rótulo direto só na ponta — número em todo ponto vira ruído. */}
        <text
          x={x(points.length - 1) + 10}
          y={y(last.value) + 4}
          className="fill-foreground text-[12px] tabular-nums"
        >
          {last.value}
        </text>

        {points.map((point, index) => (
          <text
            key={point.date}
            x={x(index)}
            y={VIEW.height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {point.label}
          </text>
        ))}

        {/* Alvos de toque: a faixa inteira do dia, bem maior que o ponto. */}
        {points.map((point, index) => (
          <rect
            key={point.date}
            x={x(index) - PLOT_W / (points.length - 1) / 2}
            y={PAD.top}
            width={PLOT_W / (points.length - 1)}
            height={PLOT_H}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${point.label}: ${point.value} ${point.value === 1 ? "mensagem" : "mensagens"}`}
            onPointerEnter={() => setHover(index)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
          />
        ))}
      </svg>

      {/* Balão: o valor lidera, o dia acompanha. */}
      {active ? (
        <div
          className="border-border bg-background pointer-events-none absolute -translate-x-1/2 rounded-md border px-3 py-2 shadow-lg"
          style={{
            left: `${(x(hover!) / VIEW.width) * 100}%`,
            top: `${(y(active.value) / VIEW.height) * 100}%`,
          }}
        >
          <p className="text-sm leading-none tabular-nums">
            {active.value} {active.value === 1 ? "mensagem" : "mensagens"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-none">{active.label}</p>
        </div>
      ) : null}

      {/* Gêmeo em tabela: todo valor legível sem depender do hover. */}
      <table className="sr-only">
        <caption>Mensagens recebidas por dia</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Mensagens</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{point.label}</th>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
