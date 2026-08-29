import { getEstablishments, getViolations } from "@/lib/data";
import { calculateRiskScore } from "@/lib/risk-engine";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { Establishment } from "@/types/entities";

// Force dynamic rendering so every navigation and request executes against the live in-memory store
export const dynamic = "force-dynamic";

export default function Home() {
  const rawEstablishmentsList = getEstablishments();
  const violations = getViolations();

  // Enrich each establishment with live calculated risk score & level
  const enriched: Establishment[] = rawEstablishmentsList.map((establishment) => {
    const establishmentViolations = violations.filter(
      (violation) => violation.establishmentId === establishment.id,
    );
    const breakdown = calculateRiskScore(establishment, establishmentViolations);

    return {
      ...establishment,
      currentRiskScore: breakdown.finalScore,
      riskLevel: breakdown.riskLevel,
    };
  });

  const sortedEstablishments = [...enriched].sort(
    (first, second) => second.currentRiskScore - first.currentRiskScore,
  );

  return (
    <DashboardView
      establishments={enriched}
      sortedEstablishments={sortedEstablishments}
      violations={violations}
    />
  );
}
