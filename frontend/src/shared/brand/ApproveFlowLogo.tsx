import type { SVGProps } from 'react';

type LogoProps = {
  compact?: boolean;
  className?: string;
};

/** A first-party vector identity; no remote assets or image fonts are required. */
export function ApproveFlowMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="approveflow-brand-gradient" x1="4" y1="6" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#09C7DE" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#approveflow-brand-gradient)" />
      <path d="M13 24.5 20.3 32 35.5 16" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 16H24" stroke="white" strokeOpacity=".46" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ApproveFlowLogo({ compact = false, className = '' }: LogoProps) {
  return (
    <span className={`af-brand ${className}`.trim()} aria-label="ApproveFlow">
      <ApproveFlowMark className="af-brand-mark" />
      {!compact && <span className="af-brand-wordmark">Approve<span>Flow</span></span>}
    </span>
  );
}
