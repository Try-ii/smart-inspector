import { NextResponse } from "next/server";
import { getEstablishments, getViolations } from "@/lib/data";
import { calculateRiskScore } from "@/lib/risk-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/establishments
 *
 * Returns all establishments sorted by calculated risk score (descending).
 * Risk scores are calculated live from the current violation data rather than
 * returning the static currentRiskScore from the JSON seed.
 */
export function GET() {
  const establishments = getEstablishments();
  const violations = getViolations();

  const enriched = establishments
    .map((est) => {
      const estViolations = violations.filter((v) => v.establishmentId === est.id);
      const breakdown = calculateRiskScore(est, estViolations);
      return {
        ...est,
        currentRiskScore: breakdown.finalScore,
        riskLevel: breakdown.riskLevel,
        violationCount: estViolations.length,
      };
    })
    .sort((a, b) => b.currentRiskScore - a.currentRiskScore);

  return NextResponse.json(enriched);
}
