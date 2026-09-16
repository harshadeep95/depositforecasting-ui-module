import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_ASSUMPTIONS, type TreeAssumptions } from "@/lib/deposit-data";

let state: TreeAssumptions = { ...DEFAULT_ASSUMPTIONS };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => state;

/** Decision-tree assumptions shared across the dashboard and the full tree page. */
export function useAssumptions() {
  const assumptions = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setAssumption = useCallback((key: keyof TreeAssumptions, value: number) => {
    state = { ...state, [key]: value };
    emit();
  }, []);

  const setAll = useCallback((next: TreeAssumptions) => {
    state = { ...next };
    emit();
  }, []);

  const reset = useCallback(() => {
    state = { ...DEFAULT_ASSUMPTIONS };
    emit();
  }, []);

  return { assumptions, setAssumption, setAll, reset };
}

/* ------------------------------ scenario library ------------------------------ */

export interface SavedScenario {
  id: string;
  name: string;
  note?: string;
  builtIn?: boolean;
  assumptions: TreeAssumptions;
}

const STORAGE_KEY = "depositiq.scenario-library.v1";

export const BUILT_IN_SCENARIOS: SavedScenario[] = [
  {
    id: "builtin-base",
    name: "Base case",
    note: "Model defaults across every driver.",
    builtIn: true,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
  },
  {
    id: "builtin-rate-rise",
    name: "Rate rise",
    note: "Base rate up: stronger inflows, higher renewal, sharper external response.",
    builtIn: true,
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      openingRate: 4.2,
      newAcctDeposit: 118,
      backBookDeposit: 112,
      renewalPropensity: 74,
      externalSensitivity: 150,
    },
  },
  {
    id: "builtin-price-war",
    name: "Competitor price war",
    note: "Aggressive competitor pricing: attrition and withdrawals rise, renewal falls.",
    builtIn: true,
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      closureRate: 3.4,
      withdrawalRate: 138,
      renewalPropensity: 41,
      transferPropensity: 165,
      externalSensitivity: 170,
    },
  },
  {
    id: "builtin-acquisition-push",
    name: "Acquisition push",
    note: "Marketing-led front-book growth with steady back-book behaviour.",
    builtIn: true,
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      openingRate: 5.3,
      newAcctDeposit: 126,
      closureRate: 1.6,
    },
  },
  {
    id: "builtin-liquidity-stress",
    name: "Liquidity stress",
    note: "Severe outflow shock for treasury contingency planning.",
    builtIn: true,
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      openingRate: 1.4,
      closureRate: 5.2,
      newAcctDeposit: 72,
      backBookDeposit: 78,
      withdrawalRate: 165,
      renewalPropensity: 30,
      externalSensitivity: 190,
    },
  },
];

let saved: SavedScenario[] = [];
let hydrated = false;
const savedListeners = new Set<() => void>();

function emitSaved() {
  for (const l of savedListeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    /* storage unavailable — library stays in-memory for the session */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as SavedScenario[];
    if (Array.isArray(parsed)) {
      saved = parsed.filter((s) => s && typeof s.id === "string" && s.assumptions);
      emitSaved();
    }
  } catch {
    /* ignore malformed storage */
  }
}

function subscribeSaved(l: () => void) {
  savedListeners.add(l);
  hydrate();
  return () => savedListeners.delete(l);
}

const getSavedSnapshot = () => saved;
const emptySaved: SavedScenario[] = [];
const getSavedServerSnapshot = () => emptySaved;

export function useScenarioLibrary() {
  const userScenarios = useSyncExternalStore(subscribeSaved, getSavedSnapshot, getSavedServerSnapshot);

  const saveScenario = useCallback((name: string, assumptions: TreeAssumptions) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = saved.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      saved = saved.map((s) => (s.id === existing.id ? { ...s, assumptions: { ...assumptions } } : s));
    } else {
      saved = [
        ...saved,
        {
          id: `user-${Date.now().toString(36)}-${saved.length}`,
          name: trimmed,
          assumptions: { ...assumptions },
        },
      ];
    }
    persist();
    emitSaved();
  }, []);

  const deleteScenario = useCallback((id: string) => {
    saved = saved.filter((s) => s.id !== id);
    persist();
    emitSaved();
  }, []);

  return { userScenarios, saveScenario, deleteScenario };
}
