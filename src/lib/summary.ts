import type { Establishment, Violation } from "@/types/entities";
import { getRiskLevel, RISK_LEVEL_LABELS_AR } from "./risk-engine";

const CATEGORY_LABELS_AR: Record<string, string> = {
  food_storage: "تخزين الأغذية",
  hygiene: "النظافة العامة",
  expired_product: "منتجات منتهية الصلاحية",
  fire_safety: "السلامة من الحريق",
  pest_control: "مكافحة الآفات",
};

const SEVERITY_LABELS_AR: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

/**
 * Generates a concise Arabic inspection summary (one short paragraph) from
 * the inspection outcome.  Per PROJECT_SPEC.md §18: "constrain the summary
 * format to 3–5 short bullet points or one short paragraph."
 */
export function generateSummary(
  establishment: Establishment,
  newViolations: Violation[],
  isRepeat: boolean,
  riskScoreBefore: number,
  riskScoreAfter: number,
): string {
  const today = new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(new Date());
  const riskAfterLabel = RISK_LEVEL_LABELS_AR[getRiskLevel(riskScoreAfter)];
  const parts: string[] = [];

  parts.push(`جولة تفتيشية على ${establishment.name} — ${today}.`);

  if (newViolations.length === 0) {
    parts.push("لم تُرصد أي مخالفات خلال هذه الجولة؛ المنشأة مستوفية للمعايير التفتيشية.");
  } else {
    const violationDescs = newViolations
      .map(
        (v) =>
          `${CATEGORY_LABELS_AR[v.category] ?? v.category} (خطورة ${SEVERITY_LABELS_AR[v.severity] ?? v.severity})`,
      )
      .join("، ");
    parts.push(`رُصدت ${newViolations.length === 1 ? "مخالفة واحدة" : `${newViolations.length} مخالفات`}: ${violationDescs}.`);

    if (isRepeat) {
      parts.push(
        "المخالفة المرصودة تكرار لمخالفة سابقة مسجلة، مما يشير إلى استمرار المشكلة وضرورة المتابعة العاجلة.",
      );
    }
  }

  if (riskScoreAfter > riskScoreBefore) {
    parts.push(
      `ارتفعت درجة خطورة المنشأة من ${riskScoreBefore} إلى ${riskScoreAfter} (${riskAfterLabel}).`,
    );
  } else if (riskScoreAfter < riskScoreBefore) {
    parts.push(
      `انخفضت درجة خطورة المنشأة من ${riskScoreBefore} إلى ${riskScoreAfter} (${riskAfterLabel}).`,
    );
  } else {
    parts.push(`درجة الخطورة الحالية ${riskScoreAfter} (${riskAfterLabel}).`);
  }

  return parts.join(" ");
}
