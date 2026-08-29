import type { Violation, ViolationCategory } from "@/types/entities";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SimilarityMatch {
  /** Whether a previous violation was considered similar to the new one. */
  matched: boolean;
  /** The previous violation that was matched, or null. */
  matchedViolation: Violation | null;
  /** Human-readable Arabic explanation of why the match was made, or null. */
  reason: string | null;
}

// ─── Keyword sets per category (used for secondary description matching) ───

/**
 * Per PROJECT_SPEC.md §18: "match by category first. Optionally add keyword
 * matching on descriptions." These keywords cover both Arabic and English since
 * the violation descriptions in the seed data are in English.
 */
const CATEGORY_KEYWORDS: Record<ViolationCategory, string[]> = {
  food_storage: ["تخزين", "حرارة", "storage", "temperature", "food", "cold", "غذاء", "أغذية"],
  hygiene: ["نظافة", "hygiene", "sanitation", "clean", "تنظيف", "صحة", "معقم"],
  expired_product: ["منتهي", "تاريخ", "expired", "expiry", "صلاحية", "انتهاء"],
  fire_safety: ["حريق", "إخلاء", "fire", "emergency", "exit", "سلامة", "طوارئ"],
  pest_control: ["آفات", "حشرات", "pest", "rodent", "insect", "نمل", "فئران"],
};

// ─── Core similarity function ───────────────────────────────────────────────

/**
 * Determines whether a newly reported violation resembles any previous
 * violation for the same establishment.
 *
 * Algorithm (two-pass, per spec):
 *  1. Primary: exact category match.
 *  2. Secondary: keyword overlap between the new description and any existing
 *     violation description using the category keyword sets above.
 *
 * Returns the first match found, or an unmatched result.
 */
export function findSimilarViolation(
  newViolation: { category: ViolationCategory; description: string },
  existingViolations: Violation[],
): SimilarityMatch {
  if (existingViolations.length === 0) {
    return { matched: false, matchedViolation: null, reason: null };
  }

  // Pass 1 — exact category match (most reliable for demo)
  const categoryMatch = existingViolations.find(
    (v) => v.category === newViolation.category,
  );

  if (categoryMatch) {
    return {
      matched: true,
      matchedViolation: categoryMatch,
      reason: `تكرار لمخالفة مسجلة من نفس النوع بتاريخ ${categoryMatch.date}.`,
    };
  }

  // Pass 2 — keyword overlap on description
  const keywords = CATEGORY_KEYWORDS[newViolation.category] ?? [];
  const newDescLower = newViolation.description.toLowerCase();

  for (const violation of existingViolations) {
    const existingDescLower = violation.description.toLowerCase();
    const keywordHit = keywords.find(
      (kw) =>
        newDescLower.includes(kw.toLowerCase()) ||
        existingDescLower.includes(kw.toLowerCase()),
    );
    if (keywordHit) {
      return {
        matched: true,
        matchedViolation: violation,
        reason: `تشابه في وصف المخالفة مع مخالفة سابقة مسجلة بتاريخ ${violation.date}.`,
      };
    }
  }

  return { matched: false, matchedViolation: null, reason: null };
}
