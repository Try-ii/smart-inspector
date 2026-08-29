import { NextResponse } from "next/server";
import { getEstablishmentById, getViolationsByEstablishment } from "@/lib/data";
import { getInspectionsByEstablishment } from "@/lib/store";
import { calculateRiskScore } from "@/lib/risk-engine";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/establishments/[id]
 *
 * Returns a single establishment with:
 *  - live-calculated risk score and breakdown
 *  - full violation history
 *  - inspection history (historical + in-session)
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const establishment = getEstablishmentById(id);
  if (!establishment) {
    return NextResponse.json(
      { error: "المنشأة غير موجودة", code: "ESTABLISHMENT_NOT_FOUND" },
      { status: 404 },
    );
  }

  const violations = getViolationsByEstablishment(id);
  const inspections = getInspectionsByEstablishment(id);
  const riskBreakdown = calculateRiskScore(establishment, violations);

  return NextResponse.json({
    ...establishment,
    currentRiskScore: riskBreakdown.finalScore,
    riskLevel: riskBreakdown.riskLevel,
    riskBreakdown,
    violations,
    inspections: inspections.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    ),
  });
}
