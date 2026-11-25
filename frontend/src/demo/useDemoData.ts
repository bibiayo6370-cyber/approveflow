import { useSyncExternalStore } from 'react';
import { demoStore } from './store';

/** A client-only state feed for later Finance/Analytics/Notifications screens. */
export function useDemoData() {
  return useSyncExternalStore(demoStore.subscribe, demoStore.getSnapshot, demoStore.getSnapshot);
}
