import type { Establishment, Violation } from "@/types/entities";
import rawEstablishments from "@/data/establishments.json";
import { getAllInspections, getAllViolations } from "@/lib/store";

/**
 * Returns the full list of establishments with live-updated inspection metadata.
 */
export function getEstablishments(): Establishment[] {
  const establishments = rawEstablishments as Establishment[];
  const inspections = getAllInspections();

  return establishments.map((est) => {
    const estInspections = inspections.filter((i) => i.establishmentId === est.id);
    if (estInspections.length === 0) return est;

    // Find the latest completed or started inspection date
    const latestDate = estInspections
      .map((i) => (i.completedAt ?? i.startedAt).split("T")[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    return {
      ...est,
      lastInspectionDate:
        latestDate && new Date(latestDate) > new Date(est.lastInspectionDate)
          ? latestDate
          : est.lastInspectionDate,
    };
  });
}

/**
 * Returns a single establishment by id with live-updated metadata, or null if not found.
 */
export function getEstablishmentById(id: string): Establishment | null {
  return getEstablishments().find((e) => e.id === id) ?? null;
}

/**
 * Returns the full live list of violations (initial seed + any in-session recorded violations).
 */
export function getViolations(): Violation[] {
  return getAllViolations();
}

/**
 * Returns live violations that belong to a specific establishment.
 */
export function getViolationsByEstablishment(establishmentId: string): Violation[] {
  return getAllViolations().filter((v) => v.establishmentId === establishmentId);
}
