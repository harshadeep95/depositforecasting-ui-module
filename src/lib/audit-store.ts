import { useSyncExternalStore } from "react";

export interface AuditEntry {
  id: string;
  ts: number;
  persona: string;
  role: string;
  area: string;
  detail: string;
}

let entries: AuditEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const getSnapshot = () => entries;
const emptyEntries: AuditEntry[] = [];
const getServerSnapshot = () => emptyEntries;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Record a change made by the active persona. Latest entry first. */
export function logChange(persona: string, role: string, area: string, detail: string) {
  const last = entries[0];
  if (last && last.persona === persona && last.area === area && last.detail === detail) return;
  entries = [{ id: `c${++seq}`, ts: Date.now(), persona, role, area, detail }, ...entries].slice(0, 200);
  for (const l of listeners) l();
}

export function useAuditLog() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
