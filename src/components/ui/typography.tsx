import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4;

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

const headingStyles: Record<HeadingLevel, string> = {
  1: "text-h2 md:text-h1",
  2: "text-h3 md:text-h2",
  3: "text-h4 md:text-h3",
  4: "text-body-lg font-medium md:text-h4",
};

interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Títulos com a escala tipográfica do Design System (Docs/08),
 * reduzidos um passo no mobile.
 */
export function Heading({ level = 2, children, className, id }: HeadingProps) {
  const Tag = headingTags[level];
  return (
    <Tag id={id} className={cn("font-heading tracking-tight", headingStyles[level], className)}>
      {children}
    </Tag>
  );
}

interface ParagraphProps {
  children: ReactNode;
  className?: string;
  size?: "body" | "lg";
}

export function Paragraph({ children, className, size = "body" }: ParagraphProps) {
  return (
    <p
      className={cn(
        size === "lg" ? "text-body-lg" : "text-body",
        "text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

interface CaptionProps {
  children: ReactNode;
  className?: string;
}

export function Caption({ children, className }: CaptionProps) {
  return <span className={cn("text-caption text-muted-foreground", className)}>{children}</span>;
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  align?: "left" | "center";
}

/**
 * Cabeçalho padrão de seção: eyebrow opcional, título e subtítulo.
 */
export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  className,
  align = "left",
}: SectionTitleProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <span className="text-caption text-muted-foreground font-medium tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
      ) : null}
      <Heading level={2} className={cn(eyebrow && "mt-4")}>
        {title}
      </Heading>
      {subtitle ? (
        <Paragraph size="lg" className="mt-6">
          {subtitle}
        </Paragraph>
      ) : null}
    </div>
  );
}
