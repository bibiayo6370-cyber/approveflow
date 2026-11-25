/** Contractually distinct presentation and business-functionality states. */
export type SourceMode = 'LIVE_API' | 'DEMO_FIXTURE';
export type CapabilityLevel = 'LIVE_MVP' | 'INTERACTIVE_DEMO' | 'FUTURE_CONCEPT';
export type ViewState<T> =
  | { status: 'loading'; source: SourceMode; label: string }
  | { status: 'ready'; data: T; source: SourceMode; label: string }
  | { status: 'empty'; data: T; source: SourceMode; label: string }
  | { status: 'error'; error: string; source: SourceMode; label: string };

export interface ReadAdapter<T> {
  readonly source: SourceMode;
  readonly label: string;
  load(): Promise<T>;
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  unit?: 'count' | 'NGN' | 'days' | 'percent';
  source: SourceMode;
  context?: string;
}

export interface FeatureDefinition {
  id: string;
  label: string;
  description: string;
  capability: CapabilityLevel;
  source: SourceMode;
  /** Link only after the route has an implemented, reviewable screen. */
  route?: string;
}

export const CAPABILITIES: readonly FeatureDefinition[] = [
  { id: 'requests', label: 'My Requests', description: 'Create, submit and track requests', capability: 'LIVE_MVP', source: 'LIVE_API', route: '/' },
  { id: 'approvals', label: 'Approvals', description: 'Review and decide on pending requests', capability: 'LIVE_MVP', source: 'LIVE_API', route: '/' },
  { id: 'analytics', label: 'Insights & Reports', description: 'Explore sample operational insights', capability: 'INTERACTIVE_DEMO', source: 'DEMO_FIXTURE' },
  { id: 'notifications', label: 'Notifications', description: 'Explore the future notification center', capability: 'INTERACTIVE_DEMO', source: 'DEMO_FIXTURE' },
  { id: 'finance', label: 'Finance', description: 'Preview approved-request processing', capability: 'INTERACTIVE_DEMO', source: 'DEMO_FIXTURE' },
  { id: 'admin', label: 'Administration', description: 'Preview organization configuration', capability: 'INTERACTIVE_DEMO', source: 'DEMO_FIXTURE' },
  { id: 'routing', label: 'Approval Routing', description: 'Preview multistage approvals', capability: 'FUTURE_CONCEPT', source: 'DEMO_FIXTURE' },
  { id: 'attachments', label: 'Attachments', description: 'Preview document references', capability: 'FUTURE_CONCEPT', source: 'DEMO_FIXTURE' },
] as const;

export function getCapability(id: string): FeatureDefinition | undefined {
  return CAPABILITIES.find(item => item.id === id);
}
