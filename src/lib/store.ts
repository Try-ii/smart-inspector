import type { Inspection, Violation } from "@/types/entities";
import rawInspections from "@/data/inspections.json";
import rawViolations from "@/data/violations.json";

/**
 * Module-level mutable store for inspection records.
 *
 * We attach the store to `globalThis` so it is truly shared across all module
 * instances in the same Node.js process. Next.js may create multiple module
 * instances per build or per request in dev mode, but `globalThis` is always
 * the single global object for the process.
 *
 * This is safe for a single-instance hackathon demo. Inspections created
 * during the demo session are retained until the server restarts.
 */

declare global {
  // eslint-disable-next-line no-var
  var __smartInspectorStore:
    | { inspections: Inspection[]; counter: number }
    | undefined;
}

function getStore() {
  if (!globalThis.__smartInspectorStore) {
    globalThis.__smartInspectorStore = {
      inspections: rawInspections as Inspection[],
      counter: (rawInspections as Inspection[]).length + 1,
    };
  }
  return globalThis.__smartInspectorStore;
}

/** Returns a snapshot of all inspections (historical + newly created). */
export function getAllInspections(): Inspection[] {
  return getStore().inspections;
}

/** Returns all violations merged from the initial seed and all in-session inspections. */
export function getAllViolations(): Violation[] {
  const store = getStore();
  const seedViolations = rawViolations as Violation[];
  const inSessionViolations = store.inspections.flatMap((i) => i.violations ?? []);

  // Use a map keyed by violation id to avoid any duplicate records
  const violationMap = new Map<string, Violation>();
  for (const v of seedViolations) {
    violationMap.set(v.id, v);
  }
  for (const v of inSessionViolations) {
    violationMap.set(v.id, v);
  }

  return Array.from(violationMap.values());
}

/** Returns a single inspection by id, or null if not found. */
export function getInspectionById(id: string): Inspection | null {
  return getStore().inspections.find((i) => i.id === id) ?? null;
}

/** Returns all inspections for a specific establishment. */
export function getInspectionsByEstablishment(establishmentId: string): Inspection[] {
  return getStore().inspections.filter((i) => i.establishmentId === establishmentId);
}

/** Persists a new inspection to the global store and returns it with its assigned id. */
export function createInspection(data: Omit<Inspection, "id">): Inspection {
  const store = getStore();
  const id = `ins-live-${String(store.counter++).padStart(3, "0")}`;
  const inspection: Inspection = { id, ...data };
  store.inspections = [...store.inspections, inspection];
  return inspection;
}
