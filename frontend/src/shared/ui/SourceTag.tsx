import type { CapabilityLevel, SourceMode } from '../../architecture/capabilities';

export function SourceTag({ mode, capability }: { mode: SourceMode; capability?: CapabilityLevel }) {
  const live = mode === 'LIVE_API';
  const label = capability === 'FUTURE_CONCEPT' ? 'Concept preview' : live ? 'Live MVP' : 'Demo preview';
  return <span className={`af-source-tag ${live ? 'af-source-live' : 'af-source-demo'}`} title={live ? 'Powered by the real ApproveFlow API' : 'Illustrative sample data; no live database changes'}>{label}</span>;
}
