import { NextResponse } from "next/server";
import type { Violation, ViolationCategory, ViolationSeverity } from "@/types/entities";
import { getEstablishmentById, getViolationsByEstablishment } from "@/lib/data";
import { createInspection, getAllInspections } from "@/lib/store";
import { calculateRiskScore } from "@/lib/risk-engine";
import { findSimilarViolation } from "@/lib/similarity";
import { generateSummary } from "@/lib/summary";

export const dynamic = "force-dynamic";

// ─── Validation helpers ─────────────────────────────────────────────────────

const VALID_CATEGORIES: ViolationCategory[] = [
  "food_storage",
  "hygiene",
  "expired_product",
  "fire_safety",
  "pest_control",
];

const VALID_SEVERITIES: ViolationSeverity[] = ["low", "medium", "high", "critical"];

function isValidCategory(v: unknown): v is ViolationCategory {
  return typeof v === "string" && VALID_CATEGORIES.includes(v as ViolationCategory);
}

function isValidSeverity(v: unknown): v is ViolationSeverity {
  return typeof v === "string" && VALID_SEVERITIES.includes(v as ViolationSeverity);
}

// ─── GET /api/inspections ───────────────────────────────────────────────────

/**
 * Returns all inspections (historical seed + in-session).
 */
export function GET() {
  return NextResponse.json(getAllInspections());
}

// ─── POST /api/inspections ──────────────────────────────────────────────────

/**
 * Creates a complete inspection for an establishment.
 *
 * Per spec §14: "For the fastest MVP, some endpoints can be combined if the
 * implementation is simpler."  This handler accepts a full inspection payload
 * (establishment, inspector, one optional violation) and returns the completed
 * inspection with similarity detection, updated risk score, and generated
 * summary in a single round trip.
 *
 * Request body:
 * {
 *   establishmentId: string
 *   inspectorName:   string
 *   violation?: {
 *     category:    ViolationCategory
 *     severity:    ViolationSeverity
 *     description: string
 *     evidenceId?: string   // demo evidence identifier
 *     notes?:      string   // inspector free-text notes
 *   }
 * }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "طلب غير صالح — يجب أن يكون الجسم بتنسيق JSON", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "طلب غير صالح", code: "INVALID_BODY" },
      { status: 400 },
    );
  }

  const { establishmentId, inspectorName, violation } = body as Record<string, unknown>;

  // ── Validate required fields ───────────────────────────────────────────

  if (typeof establishmentId !== "string" || !establishmentId.trim()) {
    return NextResponse.json(
      { error: "معرف المنشأة مطلوب", code: "MISSING_ESTABLISHMENT_ID" },
      { status: 400 },
    );
  }

  if (typeof inspectorName !== "string" || !inspectorName.trim()) {
    return NextResponse.json(
      { error: "اسم المفتش مطلوب", code: "MISSING_INSPECTOR_NAME" },
      { status: 400 },
    );
  }

  const establishment = getEstablishmentById(establishmentId);
  if (!establishment) {
    return NextResponse.json(
      { error: "المنشأة غير موجودة", code: "ESTABLISHMENT_NOT_FOUND" },
      { status: 404 },
    );
  }

  // ── Validate optional violation payload ─────────────────────────────────

  const existingViolations = getViolationsByEstablishment(establishmentId);
  const riskScoreBefore = calculateRiskScore(establishment, existingViolations).finalScore;

  let newViolations: Violation[] = [];
  let similarViolationId: string | null = null;
  let isRepeatFlag = false;

  if (violation !== undefined && violation !== null) {
    if (typeof violation !== "object") {
      return NextResponse.json(
        { error: "حقل المخالفة يجب أن يكون كائناً", code: "INVALID_VIOLATION" },
        { status: 400 },
      );
    }

    const v = violation as Record<string, unknown>;

    if (!isValidCategory(v.category)) {
      return NextResponse.json(
        { error: "نوع المخالفة غير صالح", code: "INVALID_CATEGORY" },
        { status: 400 },
      );
    }

    if (!isValidSeverity(v.severity)) {
      return NextResponse.json(
        { error: "درجة خطورة المخالفة غير صالحة", code: "INVALID_SEVERITY" },
        { status: 400 },
      );
    }

    if (typeof v.description !== "string" || !v.description.trim()) {
      return NextResponse.json(
        { error: "وصف المخالفة مطلوب", code: "MISSING_DESCRIPTION" },
        { status: 400 },
      );
    }

    // Similarity detection
    const similarity = findSimilarViolation(
      { category: v.category, description: v.description },
      existingViolations,
    );

    isRepeatFlag = similarity.matched;
    similarViolationId = similarity.matchedViolation?.id ?? null;

    const inspectionId = `ins-live-${Date.now()}`;
    const violationId = `vio-live-${Date.now()}`;

    const newViolation: Violation = {
      id: violationId,
      establishmentId,
      inspectionId,
      date: new Date().toISOString().split("T")[0],
      category: v.category,
      severity: v.severity,
      description: (v.description as string).trim(),
      evidenceUrl: typeof v.evidenceId === "string" ? `/demo-evidence/${v.evidenceId}.jpg` : null,
      isRepeat: isRepeatFlag,
      matchedPreviousViolationId: similarViolationId,
    };

    newViolations = [newViolation];
  }

  // ── Compute updated risk score (includes new violation points) ─────────

  const allViolationsAfter = [...existingViolations, ...newViolations];
  const riskBreakdownAfter = calculateRiskScore(establishment, allViolationsAfter);
  const riskScoreAfter = riskBreakdownAfter.finalScore;

  // ── Generate summary ────────────────────────────────────────────────────

  const summary = generateSummary(
    establishment,
    newViolations,
    isRepeatFlag,
    riskScoreBefore,
    riskScoreAfter,
  );

  // ── Persist inspection ──────────────────────────────────────────────────

  const now = new Date().toISOString();
  const inspection = createInspection({
    establishmentId,
    inspectorName: (inspectorName as string).trim(),
    startedAt: now,
    completedAt: now,
    status: "completed",
    violations: newViolations,
    summary,
    riskScoreBefore,
    riskScoreAfter,
  });

  return NextResponse.json(
    {
      inspection,
      riskBreakdownAfter,
      similarViolationId,
      isRepeat: isRepeatFlag,
    },
    { status: 201 },
  );
}
