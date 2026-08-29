import type {
  Establishment,
  RiskLevel,
  RiskScoreBreakdown,
  Violation,
  ViolationSeverity,
} from "@/types/entities";

// ─── Scoring constants from PROJECT_SPEC.md §9 ─────────────────────────────

/** Points added per violation, keyed by severity. */
const SEVERITY_POINTS: Record<ViolationSeverity, number> = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 30,
};

/** Extra points for each repeated / similar violation. */
const REPEAT_VIOLATION_BONUS = 15;

/** Extra points when the last inspection is older than this many days. */
const STALE_INSPECTION_DAYS = 180;
const STALE_INSPECTION_BONUS = 10;

/** Score is capped at this value. */
const MAX_SCORE = 100;

// ─── Risk level thresholds from PROJECT_SPEC.md §9 ─────────────────────────

/**
 * Maps a numeric score to its risk level using the thresholds defined in the
 * project specification:
 *   0-29  → low
 *  30-59  → medium
 *  60-79  → high
 *  80-100 → critical
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

// ─── Risk engine ───────────────────────────────────────────────────────────

/**
 * Deterministic risk score calculation per PROJECT_SPEC.md §9.
 *
 * Formula:
 *   score = baselineRisk
 *         + Σ(severityPoints per violation)
 *         + Σ(repeatBonus per repeated violation)
 *         + staleInspectionBonus (if lastInspectionDate > 180 days ago)
 *   score = min(score, 100)
 *
 * Returns a full RiskScoreBreakdown so the UI can explain each component.
 */
export function calculateRiskScore(
  establishment: Establishment,
  violations: Violation[],
): RiskScoreBreakdown {
  let violationPoints = 0;
  let repeatViolationPoints = 0;

  for (const violation of violations) {
    violationPoints += SEVERITY_POINTS[violation.severity];
    if (violation.isRepeat) {
      repeatViolationPoints += REPEAT_VIOLATION_BONUS;
    }
  }

  const lastInspectionDate = new Date(establishment.lastInspectionDate);
  const now = new Date();
  const daysSinceLast = Math.floor(
    (now.getTime() - lastInspectionDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const staleInspectionPoints =
    daysSinceLast > STALE_INSPECTION_DAYS ? STALE_INSPECTION_BONUS : 0;

  const rawScore =
    establishment.baselineRisk +
    violationPoints +
    repeatViolationPoints +
    staleInspectionPoints;

  const finalScore = Math.min(rawScore, MAX_SCORE);

  return {
    baselineRisk: establishment.baselineRisk,
    violationPoints,
    repeatViolationPoints,
    staleInspectionPoints,
    finalScore,
    riskLevel: getRiskLevel(finalScore),
  };
}

/**
 * Human-readable Arabic label for a risk level.
 * Kept here so other modules can import a single canonical label source.
 */
export const RISK_LEVEL_LABELS_AR: Record<RiskLevel, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};
