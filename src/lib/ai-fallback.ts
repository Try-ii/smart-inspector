import type { AiViolationSuggestion } from "@/types/entities";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DemoEvidence {
  /** Stable identifier used in form submissions and URL params. */
  id: string;
  /** Short Arabic label shown in the evidence selector. */
  label: string;
  /** Longer Arabic description of what the evidence depicts. */
  description: string;
  /** The deterministic AI suggestion that this evidence triggers. */
  suggestion: AiViolationSuggestion;
}

// ─── Demo evidence catalogue ────────────────────────────────────────────────

/**
 * Preloaded demo evidence scenarios with predictable AI outputs.
 *
 * Per PROJECT_SPEC.md §18: "use curated demo images and allow manual editing.
 * Keep fallback mock suggestions for demo reliability."
 *
 * Since no actual image files exist at this stage, each entry is identified by
 * an id.  The InspectionForm renders these as labelled cards.  The
 * corresponding image files (e.g. /demo-evidence/food-storage-01.jpg) can be
 * dropped in public/demo-evidence/ in a later phase without changing this module.
 */
export const DEMO_EVIDENCE_OPTIONS: DemoEvidence[] = [
  {
    id: "food-storage-demo",
    label: "مخزن غذائي غير آمن",
    description: "مواد غذائية خام مكشوفة أو مخزنة في درجات حرارة غير آمنة",
    suggestion: {
      category: "food_storage",
      severity: "high",
      description:
        "رُصدت مواد غذائية خام مخزنة في درجات حرارة غير آمنة مع احتمال تلوث واضح.",
      confidence: 0.91,
      source: "deterministic_fallback",
    },
  },
  {
    id: "hygiene-demo",
    label: "مشكلة نظافة",
    description: "أسطح تحضير أو أدوات غير معقمة لا تستوفي معايير التفتيش",
    suggestion: {
      category: "hygiene",
      severity: "medium",
      description:
        "أسطح تحضير الطعام لا تستوفي معايير النظافة التفتيشية؛ رُصد غياب مواد التعقيم.",
      confidence: 0.87,
      source: "deterministic_fallback",
    },
  },
  {
    id: "expired-product-demo",
    label: "منتج منتهي الصلاحية",
    description: "منتجات معبأة معروضة بعد تاريخ انتهاء صلاحيتها",
    suggestion: {
      category: "expired_product",
      severity: "medium",
      description:
        "عُثر على منتجات معبأة معروضة للبيع بعد تاريخ انتهاء صلاحيتها.",
      confidence: 0.95,
      source: "deterministic_fallback",
    },
  },
  {
    id: "fire-safety-demo",
    label: "مخالفة سلامة الحريق",
    description: "مسار إخلاء مسدود أو معدات سلامة مفقودة",
    suggestion: {
      category: "fire_safety",
      severity: "high",
      description:
        "مسار الإخلاء في حالات الطوارئ مسدود جزئياً بمواد مخزنة، مما يشكل خطراً مباشراً.",
      confidence: 0.88,
      source: "deterministic_fallback",
    },
  },
  {
    id: "pest-control-demo",
    label: "نشاط آفات",
    description: "نشاط آفات أو حشرات مرئي في منطقة تحضير الطعام",
    suggestion: {
      category: "pest_control",
      severity: "critical",
      description:
        "رُصد نشاط آفات واضح في منطقة تحضير الطعام؛ يستوجب إجراءً فورياً.",
      confidence: 0.93,
      source: "deterministic_fallback",
    },
  },
];

/**
 * Returns the deterministic AI suggestion for a given demo evidence id,
 * or null if the id is unknown.
 */
export function getSuggestionByEvidenceId(evidenceId: string): AiViolationSuggestion | null {
  return DEMO_EVIDENCE_OPTIONS.find((e) => e.id === evidenceId)?.suggestion ?? null;
}
