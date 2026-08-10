const DESKTOP_HEADLINE_LINES = [
  'Learn computer science visually.',
  'with seamless note-making.',
  'Connect AI agents through MCP.',
] as const;

const MOBILE_HEADLINE_LINES = [
  'Learn computer',
  'science visually.',
  'with seamless note-making.',
  'Connect AI agents',
  'through MCP.',
] as const;

interface WrittenLinesProps {
  className: string;
  lines: readonly string[];
}

const WrittenLines = ({ className, lines }: WrittenLinesProps) => (
  <span aria-hidden="true" className={className}>
    {lines.map((line, index) => (
      <span key={line} className={`lp-liquid-line lp-liquid-line--${index + 1}`}>
        {line}
        <span aria-hidden="true" className="lp-liquid-sheen">
          {line}
        </span>
      </span>
    ))}
  </span>
);

export function LiquidGlassHeadline() {
  return (
    <h1 className="lp-liquid-headline mt-6 w-full max-w-[980px] text-[clamp(2.45rem,5.4vw,4.65rem)] font-normal leading-[0.96] tracking-[0.002em] text-[var(--lp-hero-ink)] sm:mt-7">
      <span className="sr-only">
        Learn computer science visually. With seamless note-making. Connect AI agents through MCP.
      </span>
      <WrittenLines
        className="lp-liquid-group lp-liquid-group--mobile sm:hidden"
        lines={MOBILE_HEADLINE_LINES}
      />
      <WrittenLines
        className="lp-liquid-group lp-liquid-group--desktop hidden sm:block"
        lines={DESKTOP_HEADLINE_LINES}
      />
    </h1>
  );
}
