import type { ReactNode } from 'react';

/**
 * FeatureRow — one flat, hairline-divided, edge-to-edge feature block in the
 * Composio "why" section. Text on one side, a visual (GradientPanel + sketch) on
 * the other; `reversed` alternates the sides. Sharp corners, no card frame, no
 * shadow — the divider and spacing carry the structure. Single column on mobile.
 */

interface FeatureRowProps {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  reversed?: boolean;
  /** The visual (right side on default rows). */
  children: ReactNode;
  /** Optional controls under the copy (language tabs, stage pills). */
  controls?: ReactNode;
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="mt-[3px] shrink-0">
      <path
        d="M2.5 7.5 L5.5 10.5 L11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeatureRow({ id, eyebrow, title, body, bullets, reversed, children, controls }: FeatureRowProps) {
  return (
    <div
      id={id}
      className="grid grid-cols-1 items-center gap-10 border-t py-16 sm:py-20 lg:grid-cols-2 lg:gap-16"
      style={{ borderColor: 'var(--lp-border)' }}
    >
      <div className={reversed ? 'lg:order-2' : ''}>
        <div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: 'var(--lp-text-3)' }}
        >
          {eyebrow}
        </div>
        <h3
          className="font-display text-[28px] leading-[1.05] tracking-[-0.02em] sm:text-[36px]"
          style={{ color: 'var(--lp-text)' }}
        >
          {title}
        </h3>
        <p
          className="mt-5 max-w-[46ch] text-[15px] leading-relaxed"
          style={{ color: 'var(--lp-text-2)' }}
        >
          {body}
        </p>

        {bullets && bullets.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2.5">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 font-mono text-[13px]"
                style={{ color: 'var(--lp-text-2)' }}
              >
                <span style={{ color: 'var(--lp-accent)' }}>
                  <Check />
                </span>
                {b}
              </li>
            ))}
          </ul>
        )}

        {controls && <div className="mt-7">{controls}</div>}
      </div>

      <div className={reversed ? 'lg:order-1' : ''}>{children}</div>
    </div>
  );
}
