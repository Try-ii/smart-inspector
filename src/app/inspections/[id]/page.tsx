import { notFound } from "next/navigation";
import Link from "next/link";
import { getInspectionById } from "@/lib/store";
import { getEstablishmentById } from "@/lib/data";
import { getRiskLevel, RISK_LEVEL_LABELS_AR } from "@/lib/risk-engine";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export const dynamic = "force-dynamic";
import {
  AlertIcon,
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  FileCheckIcon,
  InspectorIcon,
  RepeatIcon,
  ShieldAlertIcon,
  SparkleIcon,
} from "@/components/dashboard/icons";

// ─── Label maps ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  food_storage: "تخزين الأغذية",
  hygiene: "النظافة العامة",
  expired_product: "منتجات منتهية الصلاحية",
  fire_safety: "السلامة من الحريق",
  pest_control: "مكافحة الآفات",
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" }).format(
      new Date(dateStr),
    );
  } catch {
    return dateStr;
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InspectionResultPage({ params }: PageProps) {
  const { id } = await params;

  const inspection = getInspectionById(id);
  if (!inspection) notFound();

  const establishment = getEstablishmentById(inspection.establishmentId);
  const scoreAfter = inspection.riskScoreAfter ?? inspection.riskScoreBefore;
  const scoreBefore = inspection.riskScoreBefore;
  const riskLevelAfter = getRiskLevel(scoreAfter);
  const scoreDelta = scoreAfter - scoreBefore;
  const hasViolations = inspection.violations.length > 0;
  const hasRepeat = inspection.violations.some((v) => v.isRepeat);

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

  const getSeverityBadgeStyles = (sev: string) => {
    if (sev === "critical") {
      return "text-risk-critical bg-risk-criticalBg border border-risk-critical/20";
    }
    if (sev === "high") {
      return "text-risk-high bg-risk-highBg border border-risk-high/20";
    }
    if (sev === "medium") {
      return "text-risk-medium bg-risk-mediumBg border border-risk-medium/20";
    }
    return "text-risk-low bg-risk-lowBg border border-risk-low/20";
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
            {establishment && (
              <>
                <Link
                  href={`/establishments/${establishment.id}`}
                  className="text-gov-muted hover:text-gov-charcoal transition"
                >
                  {establishment.name}
                </Link>
                <span className="text-gov-border">/</span>
              </>
            )}
            <span className="text-gov-charcoal font-bold">
              تقرير ونتيجة الجولة التفتيشية
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gov-emerald/10 text-gov-emerald text-[11px] font-bold border border-gov-emerald/30">
              <CheckCircleIcon size={13} className="text-gov-emerald" />
              جولة مكتملة ومعتمدة
            </span>
          </div>
        </nav>

        {/* ── Main Inspection Result Hero Header ──────────────────────────── */}
        <section className="mb-8 bg-white border border-gov-border rounded-md gov-card-shadow overflow-hidden">
          {/* Top Status Bar */}
          <div className="bg-gov-sandlight/80 px-5 py-3 border-b border-gov-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold bg-gov-charcoal text-gov-sandlight px-2.5 py-0.5 rounded font-mono text-[11px] border border-gov-slate">
                {inspection.id}
              </span>
              <span className="text-gov-muted">
                المفتش المسند:{" "}
                <strong className="text-gov-charcoal font-medium">
                  {inspection.inspectorName}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-gov-muted font-mono text-[11px]">
              <CalendarIcon size={13} className="text-gov-emerald" />
              <span>
                {formatDate(inspection.completedAt ?? inspection.startedAt)}
              </span>
            </div>
          </div>

          {/* Core Result Presentation */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gov-border">
              <div className="space-y-2">
                <div className="text-[11px] text-gov-muted font-medium">
                  المنشأة الخاضعة للتفتيش
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gov-charcoal tracking-tight">
                  {establishment?.name ?? "المنشأة"}
                </h1>
                <p className="text-xs text-gov-muted">
                  {establishment?.district} — رقم الترخيص:{" "}
                  <strong className="font-mono text-gov-charcoal">
                    {establishment?.licenseNumber}
                  </strong>
                </p>
              </div>

              {/* Visual Before → After Risk Score Comparison */}
              <div className="bg-gov-canvas p-4 rounded-md border border-gov-border flex items-center gap-4 self-start lg:self-auto">
                <div className="text-center px-3">
                  <span className="text-[11px] text-gov-muted block mb-0.5">
                    قبل الجولة
                  </span>
                  <div className="text-xl font-bold text-gov-muted font-num">
                    {scoreBefore}
                  </div>
                  <span className="text-[9px] text-gov-subtle font-mono">
                    / 100
                  </span>
                </div>

                <span
                  className="text-lg font-bold text-gov-charcoal px-1"
                  aria-hidden="true"
                >
                  ←
                </span>

                <div className="text-center px-3 bg-white rounded p-2 border border-gov-border">
                  <span className="text-[11px] text-gov-charcoal block font-bold mb-0.5">
                    بعد الجولة
                  </span>
                  <div className="text-2xl font-bold text-gov-charcoal font-num">
                    {scoreAfter}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRiskBadgeStyles(
                      riskLevelAfter,
                    )}`}
                  >
                    {RISK_LEVEL_LABELS_AR[riskLevelAfter]}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Delta Impact Banner */}
            <div className="pt-5">
              {scoreDelta !== 0 ? (
                <div
                  className={`p-3.5 rounded-md text-xs font-semibold flex items-center justify-between border ${
                    scoreDelta > 0
                      ? "bg-risk-criticalBg border-risk-criticalBorder text-risk-critical"
                      : "bg-risk-lowBg border-risk-lowBorder text-risk-low"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertIcon size={16} />
                    <span>
                      {scoreDelta > 0
                        ? `ارتفع مؤشر الخطورة بمقدار +${scoreDelta} نقطة نتيجة رصد المخالفة وتحديث بيانات الامتثال.`
                        : `انخفض مؤشر الخطورة بمقدار ${scoreDelta} نقطة بعد ثبوت الامتثال.`}
                    </span>
                  </div>
                  {hasRepeat && (
                    <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-risk-critical/30">
                      شامل +15 نقطة لتكرار المخالفة
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gov-sandlight/60 rounded text-xs text-gov-muted border border-gov-border">
                  استقرت درجة الخطورة عند {scoreAfter} نقطة دون تغيير بعد الجولة.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION: DETECTED VIOLATIONS ──────────────────────────────────── */}
        <section className="mb-8" aria-label="المخالفات المرصودة">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
                <ShieldAlertIcon size={14} />
                <span>نتائج الرصد الميداني</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gov-charcoal">
                المخالفات المسجلة في هذه الجولة
              </h2>
            </div>
            <span className="text-xs text-gov-muted font-num">
              {hasViolations
                ? `${inspection.violations.length} مخالفة مرصودة`
                : "لا توجد مخالفات"}
            </span>
          </div>

          {!hasViolations ? (
            <div className="bg-white border border-gov-border rounded-md p-8 text-center text-gov-emerald text-xs font-medium">
              <CheckCircleIcon
                size={24}
                className="mx-auto mb-2 text-gov-emerald"
              />
              لم تُرصد أي مخالفات خلال هذه الجولة التفتيشية. المنشأة مستوفية
              لكافة معايير اللائحة البلدية.
            </div>
          ) : (
            <div className="space-y-3">
              {inspection.violations.map((v) => (
                <article
                  key={v.id}
                  className="bg-white border border-gov-border rounded-md p-5 gov-card-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-gov-borderLight">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-gov-charcoal">
                        {CATEGORY_LABELS[v.category] ?? v.category}
                      </strong>
                      {v.isRepeat && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-risk-criticalBg text-risk-critical border border-risk-criticalBorder">
                          <RepeatIcon size={11} />
                          مخالفة متكررة ⚠
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold font-num ${getSeverityBadgeStyles(
                          v.severity,
                        )}`}
                      >
                        درجة {SEVERITY_LABELS[v.severity] ?? v.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gov-charcoal leading-relaxed mb-3">
                    {v.description}
                  </p>

                  {v.isRepeat && (
                    <div className="p-3 bg-risk-criticalBg/60 border border-risk-criticalBorder rounded text-xs text-risk-critical flex items-center gap-2 leading-relaxed">
                      <RepeatIcon size={14} className="flex-shrink-0" />
                      <span>
                        تمت مطابقة هذه المخالفة آلياً مع مخالفة سابقة لنفس المنشأة؛
                        تم تطبيق المعامل المضاعف (+15 نقطة) لتشديد الأولوية
                        الرقابية.
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION: GENERATED REPORT NARRATIVE ────────────────────────────── */}
        {inspection.summary && (
          <section className="mb-10" aria-label="ملخص التقرير">
            <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-2">
              <SparkleIcon size={14} />
              <span>التقرير الرقابي المولَّد آلياً</span>
            </div>
            <h2 className="text-lg font-bold text-gov-charcoal mb-4">
              ملخص الجولة التفتيشية المعتمد
            </h2>

            <div className="bg-gov-sandlight/70 border-r-4 border-gov-charcoal border border-gov-border rounded-md p-6 gov-card-shadow">
              <blockquote className="text-xs text-gov-charcoal leading-loose font-normal">
                {inspection.summary}
              </blockquote>
              <div className="mt-4 pt-3 border-t border-gov-border flex items-center justify-between text-[10px] text-gov-muted font-mono">
                <span>تم التوليد والتصديق آلياً بواسطة محرك المفتش الذكي</span>
                <span>الرمز المرجعي: {inspection.id}</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Footer Navigation Actions ─────────────────────────────────────── */}
        <div className="pt-6 border-t border-gov-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gov-charcoal text-white rounded font-semibold hover:bg-gov-slate transition shadow-xs w-full sm:w-auto"
          >
            <ChevronLeftIcon size={14} />
            <span>العودة إلى لوحة التحكم الرئيسية</span>
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {establishment && (
              <Link
                href={`/establishments/${establishment.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gov-border rounded text-gov-charcoal hover:bg-gov-sandlight transition font-medium w-full sm:w-auto"
              >
                <Building2Icon size={14} />
                <span>ملف المنشأة</span>
              </Link>
            )}
            {establishment && (
              <Link
                href={`/establishments/${establishment.id}/inspect`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gov-border rounded text-gov-charcoal hover:bg-gov-sandlight transition font-medium w-full sm:w-auto"
              >
                <ClipboardCheckIcon size={14} />
                <span>جولة جديدة</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
