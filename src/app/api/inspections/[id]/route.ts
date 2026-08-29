import { NextResponse } from "next/server";
import { getInspectionById } from "@/lib/store";
import { getEstablishmentById } from "@/lib/data";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/inspections/[id]
 *
 * Returns a single inspection record (historical or in-session) together with
 * the associated establishment profile so the result page doesn't need a second
 * network request.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const inspection = getInspectionById(id);
  if (!inspection) {
    return NextResponse.json(
      { error: "الجولة التفتيشية غير موجودة", code: "INSPECTION_NOT_FOUND" },
      { status: 404 },
    );
  }

  const establishment = getEstablishmentById(inspection.establishmentId);

  return NextResponse.json({ inspection, establishment });
}
