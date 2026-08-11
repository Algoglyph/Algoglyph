const DESKTOP_HEADLINE_LINES = [
  'Connect your AI agent',
  'to a visual workspace.',
] as const;

const MOBILE_HEADLINE_LINES = [
  'Connect your',
  'AI agent to a',
  'visual',
  'workspace.',
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
    <h1 className="lp-liquid-headline w-full max-w-[940px] text-[clamp(1.8rem,8vw,2.4rem)] font-normal leading-[1.06] tracking-[-0.025em] text-[var(--lp-hero-ink)] sm:text-[clamp(2.25rem,4vw,4.25rem)] sm:leading-[1.02]">
      <span className="sr-only">
        Connect your AI agent to a visual workspace.
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
