import type { ReactNode } from 'react';

export function Card({ children, className = '', title, eyebrow }: {
  children: ReactNode; className?: string; title?: string; eyebrow?: string;
}) {
  return (
    <section className={`af-surface ${className}`.trim()}>
      {(title || eyebrow) && <header className="af-card-header">
        {eyebrow && <span className="af-eyebrow">{eyebrow}</span>}
        {title && <h2>{title}</h2>}
      </header>}
      {children}
    </section>
  );
}
