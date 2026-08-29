import { notFound } from "next/navigation";
import Link from "next/link";
import { getEstablishmentById, getViolationsByEstablishment } from "@/lib/data";
import { calculateRiskScore, RISK_LEVEL_LABELS_AR } from "@/lib/risk-engine";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export const dynamic = "force-dynamic";
import { InspectionForm } from "./InspectionForm";
import {
  Building2Icon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/dashboard/icons";

const TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم وإعاشة",
  grocery: "تموينات ومواد غذائية",
  pharmacy: "صيدلية ورعاية صحية",
  warehouse: "مستودع وتخزين",
  salon: "صالون وعناية شخصية",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectPage({ params }: PageProps) {
  const { id } = await params;

  const establishment = getEstablishmentById(id);
  if (!establishment) notFound();

  const violations = getViolationsByEstablishment(id);
  const breakdown = calculateRiskScore(establishment, violations);

  const getRiskBadgeStyles = (level: string) => {
    if (level === "critical") {
      return "bg-risk-criticalBg text-risk-critical border-risk-criticalBorder";
    }
    if (level === "high") {
      return "bg-risk-highBg text-risk-high border-risk-highBorder";
    }
    if (level === "medium") {
      return "bg-risk-mediumBg text-risk-medium border-risk-mediumBorder";
    }
    return "bg-risk-lowBg text-risk-low border-risk-lowBorder";
  };

  return (
    <>
      <SidebarNav urgentCount={3} />

      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-10 max-w-7xl mx-auto w-full z-10">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-xs text-gov-muted mb-6 pb-4 border-b border-gov-border"
          aria-label="مسار التنقل"
        >
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-gov-muted hover:text-gov-charcoal transition font-medium"
            >
              الرئيسية
            </Link>
            <span className="text-gov-border">/</span>
            <Link
              href={`/establishments/${establishment.id}`}
              className="text-gov-muted hover:text-gov-charcoal transition"
            >
              {establishment.name}
            </Link>
            <span className="text-gov-border">/</span>
            <span className="text-gov-charcoal font-bold">
              واجهة التفتيش الميداني
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gov-sandlight text-gov-charcoal text-[11px] font-medium border border-gov-border">
              <ShieldCheckIcon size={13} className="text-gov-emerald" />
              جولة تفتيشية نشطة
            </span>
          </div>
        </nav>

        {/* ── Workspace Header ───────────────────────────────────────────── */}
        <header className="mb-8 bg-white border border-gov-border rounded-md gov-card-shadow p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gov-muted">
                <span className="font-mono font-bold bg-gov-sandlight px-2 py-0.5 rounded text-[11px] text-gov-charcoal border border-gov-border">
                  {establishment.licenseNumber}
                </span>
                <span className="text-gov-border">·</span>
                <span>{TYPE_LABELS[establishment.type] ?? establishment.type}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gov-charcoal tracking-tight">
                {establishment.name}
              </h1>
              <p className="text-xs text-gov-muted flex items-center gap-1.5 pt-0.5">
                <MapPinIcon size={14} className="text-gov-emerald" />
                {establishment.district} — {establishment.address}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gov-canvas px-4 py-3 rounded border border-gov-border flex-shrink-0 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[11px] text-gov-muted block font-medium">
                  مؤشر الخطورة الحالي
                </span>
                <span className="text-xs font-bold text-risk-critical">
                  مستوى {RISK_LEVEL_LABELS_AR[breakdown.riskLevel]}
                </span>
              </div>
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border font-num ${getRiskBadgeStyles(
                  breakdown.riskLevel,
                )}`}
              >
                {breakdown.finalScore}
              </div>
            </div>
          </div>
        </header>

        {/* ── Inspection Form ────────────────────────────────────────────── */}
        <InspectionForm
          establishment={establishment}
          existingViolations={violations}
          riskScore={breakdown.finalScore}
          riskLevel={breakdown.riskLevel}
        />
      </main>
    </>
  );
}
