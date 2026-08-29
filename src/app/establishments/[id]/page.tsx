import { notFound } from "next/navigation";
import Link from "next/link";
import { getEstablishmentById, getViolationsByEstablishment } from "@/lib/data";
import { getInspectionsByEstablishment } from "@/lib/store";
import { calculateRiskScore, RISK_LEVEL_LABELS_AR } from "@/lib/risk-engine";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export const dynamic = "force-dynamic";
import {
  AlertIcon,
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  ChevronLeftIcon,
  ClipboardIcon,
  FileCheckIcon,
  MapPinIcon,
  RepeatIcon,
  ShieldAlertIcon,
  SlidersIcon,
  UtensilsIcon,
} from "@/components/dashboard/icons";

// ─── Label helpers ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  restaurant: "مطعم وإعاشة",
  grocery: "تموينات ومواد غذائية",
  pharmacy: "صيدلية ورعاية صحية",
  warehouse: "مستودع وتخزين",
  salon: "صالون وعناية شخصية",
};

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

// ─── Page ───────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstablishmentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const establishment = getEstablishmentById(id);
  if (!establishment) notFound();

  const violations = getViolationsByEstablishment(id);
  const inspections = getInspectionsByEstablishment(id).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const breakdown = calculateRiskScore(establishment, violations);
  const repeatCount = violations.filter((v) => v.isRepeat).length;

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
        {/* ── Breadcrumb & Top Navigation ─────────────────────────────────── */}
        <nav
          className="flex flex-wrap items-center justify-between gap-3 text-xs text-gov-muted mb-6 pb-4 border-b border-gov-border"
          aria-label="مسار التنقل"
        >
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-gov-muted hover:text-gov-charcoal font-medium transition"
            >
              الرئيسية
            </Link>
            <span className="text-gov-border">/</span>
            <Link
              href="/#establishments"
              className="text-gov-muted hover:text-gov-charcoal transition"
            >
              سجل المنشآت الخاضعة
            </Link>
            <span className="text-gov-border">/</span>
            <span className="text-gov-charcoal font-bold">{establishment.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gov-sandlight text-gov-charcoal text-[11px] font-medium border border-gov-border">
              <Building2Icon size={13} className="text-gov-emerald" />
              سجل رقابي موحد
            </span>
          </div>
        </nav>

        {/* ── Main Establishment Dossier Hero ───────────────────────────────── */}
        <section className="mb-8 bg-white border border-gov-border rounded-md gov-card-shadow overflow-hidden">
          {/* Top Metadata Strip */}
          <div className="bg-gov-sandlight/80 px-5 py-3 border-b border-gov-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold bg-gov-charcoal text-gov-sandlight px-2.5 py-0.5 rounded font-mono text-[11px] border border-gov-slate">
                {establishment.licenseNumber}
              </span>
              <span className="text-gov-muted">
                المالك:{" "}
                <strong className="text-gov-charcoal font-medium">
                  {establishment.ownerName}
                </strong>
              </span>
              <span className="text-gov-border">|</span>
              <span className="text-gov-muted">
                النشاط:{" "}
                <strong className="text-gov-charcoal font-medium">
                  {TYPE_LABELS[establishment.type] ?? establishment.type}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded border ${getRiskBadgeStyles(
                  breakdown.riskLevel,
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-pulse" />
                مستوى الخطر: {RISK_LEVEL_LABELS_AR[breakdown.riskLevel]}
              </span>
            </div>
          </div>

          {/* Dossier Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gov-border">
              <div className="space-y-2.5 max-w-2xl">
                <div className="text-[11px] text-gov-muted font-medium">
                  الملف الرقابي للمنشأة
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gov-charcoal tracking-tight">
                  {establishment.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gov-muted pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon size={14} className="text-gov-emerald" />
                    {establishment.district} — {establishment.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-gov-emerald" />
                    آخر جولة معتمدة: {formatDate(establishment.lastInspectionDate)}
                  </span>
                </div>
              </div>

              {/* Risk Score & Primary Action */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 bg-gov-canvas p-4 rounded border border-gov-border">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-gov-muted font-medium">
                      درجة الخطورة الحالية
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gov-charcoal font-num leading-tight">
                      {breakdown.finalScore}{" "}
                      <span className="text-xs text-gov-muted font-mono font-normal">
                        / 100
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border font-num ${getRiskBadgeStyles(
                      breakdown.riskLevel,
                    )}`}
                  >
                    {breakdown.finalScore}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/establishments/${establishment.id}/inspect`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gov-charcoal text-white rounded text-xs font-semibold hover:bg-gov-slate transition shadow-xs w-full sm:w-auto"
                  >
                    <ClipboardIcon size={15} className="text-gov-sand" />
                    <span>بدء الجولة التفتيشية</span>
                    <ArrowLeftIcon size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 text-xs">
              <div className="bg-gov-canvas p-3 rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  المخالفات المسجلة:
                </span>
                <strong className="font-bold text-gov-charcoal text-sm mt-0.5 block font-num">
                  {violations.length} مخالفات
                </strong>
              </div>
              <div className="bg-gov-canvas p-3 rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  المخالفات المتكررة:
                </span>
                <strong className="font-bold text-risk-critical text-sm mt-0.5 block font-num">
                  {repeatCount} {repeatCount > 0 ? "(تكرار مرصود)" : "(لا يوجد)"}
                </strong>
              </div>
              <div className="bg-gov-canvas p-3 rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  الجولات السابقة:
                </span>
                <strong className="font-bold text-gov-charcoal text-sm mt-0.5 block font-num">
                  {inspections.length} جولات
                </strong>
              </div>
              <div className="bg-gov-canvas p-3 rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  حالة الامتثال:
                </span>
                <strong className="font-bold text-gov-charcoal text-sm mt-0.5 block">
                  {breakdown.finalScore >= 80
                    ? "تتطلب تدخلاً فورياً"
                    : breakdown.finalScore >= 60
                    ? "أولوية تفتيشية عالية"
                    : "تحت الرقابة الدورية"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── Risk Calculation Breakdown ────────────────────────────────────── */}
        <section className="mb-8" aria-label="تفصيل درجة الخطورة">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
                <SlidersIcon size={14} />
                <span>محرك تقييم المخاطر الرقابي</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gov-charcoal">
                تفصيل معادلة احتساب مؤشر الخطورة
              </h2>
            </div>
            <span className="text-xs text-gov-muted font-mono">
              معادلة دقيقة · قابلة للتفسير الكامل
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-3">
            <div className="bg-white p-4 rounded-md border border-gov-border gov-card-shadow">
              <span className="text-gov-muted block text-[11px] mb-1">
                المخاطرة الأساسية للنشاط
              </span>
              <div className="text-2xl font-bold text-gov-charcoal font-num">
                {breakdown.baselineRisk}
              </div>
              <p className="text-gov-muted text-[11px] mt-1">
                وزن النشاط والخدمة حسب التصنيف البلدي
              </p>
            </div>

            <div className="bg-white p-4 rounded-md border border-gov-border gov-card-shadow">
              <span className="text-gov-muted block text-[11px] mb-1">
                نقاط المخالفات المرصودة
              </span>
              <div className="text-2xl font-bold text-risk-high font-num">
                +{breakdown.violationPoints}
              </div>
              <p className="text-gov-muted text-[11px] mt-1">
                مجموع أوزان الخطورة لكافة المخالفات ({violations.length})
              </p>
            </div>

            <div className="bg-white p-4 rounded-md border border-gov-border gov-card-shadow">
              <span className="text-gov-muted block text-[11px] mb-1">
                مضاعف المخالفات المتكررة
              </span>
              <div className="text-2xl font-bold text-risk-critical font-num">
                +{breakdown.repeatViolationPoints}
              </div>
              <p className="text-gov-muted text-[11px] mt-1">
                +15 نقطة لكل مخالفة متكررة ({repeatCount} متكررة)
              </p>
            </div>

            <div className="bg-white p-4 rounded-md border border-gov-border gov-card-shadow">
              <span className="text-gov-muted block text-[11px] mb-1">
                معامل تباعد الجولات (Stale)
              </span>
              <div className="text-2xl font-bold text-gov-charcoal font-num">
                +{breakdown.staleInspectionPoints}
              </div>
              <p className="text-gov-muted text-[11px] mt-1">
                دالة زمنية في حال تجاوز 180 يوماً دون تفتيش
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-gov-sandlight/70 border border-gov-border rounded-md text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-gov-charcoal">
              <strong>النتيجة النهائية للمحرك:</strong> المجموع الحسابي المحسوب{" "}
              <strong className="font-num text-gov-charcoal">
                {breakdown.finalScore} من 100
              </strong>{" "}
              (سقف مؤشر الخطر 100 نقطة).
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded border text-[11px] ${getRiskBadgeStyles(
                breakdown.riskLevel,
              )}`}
            >
              {RISK_LEVEL_LABELS_AR[breakdown.riskLevel]}
            </span>
          </div>
        </section>

        {/* ── Violations History Section ────────────────────────────────────── */}
        <section className="mb-8" aria-label="سجل المخالفات">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
                <ShieldAlertIcon size={14} />
                <span>سجل المخالفات والتجاوزات</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gov-charcoal">
                المخالفات السابقة المسجلة
              </h2>
            </div>
            <span className="text-xs text-gov-muted font-num">
              {violations.length} مخالفات مقيدة
            </span>
          </div>

          {violations.length === 0 ? (
            <div className="bg-white border border-gov-border rounded-md p-8 text-center text-gov-muted text-xs">
              ✓ لا توجد مخالفات سابقة مسجلة لهذه المنشأة. سجل الامتثال نظيف.
            </div>
          ) : (
            <div className="space-y-3">
              {violations
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((v) => (
                  <article
                    key={v.id}
                    className="bg-white border border-gov-border rounded-md p-4 md:p-5 gov-card-shadow gov-card-hover"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-gov-charcoal">
                          {CATEGORY_LABELS[v.category] ?? v.category}
                        </strong>
                        {v.isRepeat && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-risk-criticalBg text-risk-critical border border-risk-criticalBorder">
                            <RepeatIcon size={11} />
                            مخالفة متكررة (+15 نقطة)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-gov-muted">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold font-num ${getSeverityBadgeStyles(
                            v.severity,
                          )}`}
                        >
                          خطورة {SEVERITY_LABELS[v.severity] ?? v.severity}
                        </span>
                        <span className="font-mono text-gov-subtle">
                          {formatDate(v.date)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gov-muted leading-relaxed">
                      {v.description}
                    </p>
                  </article>
                ))}
            </div>
          )}
        </section>

        {/* ── Inspection History Section ────────────────────────────────────── */}
        {inspections.length > 0 && (
          <section className="mb-10" aria-label="سجل الجولات">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
                  <FileCheckIcon size={14} />
                  <span>السجل الميداني</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gov-charcoal">
                  الجولات التفتيشية المعتمدة
                </h2>
              </div>
              <span className="text-xs text-gov-muted font-num">
                {inspections.length} جولات منجزة
              </span>
            </div>

            <div className="space-y-3">
              {inspections.map((ins) => (
                <article
                  key={ins.id}
                  className="bg-white border border-gov-border rounded-md p-4 md:p-5 gov-card-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gov-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-gov-sandlight flex items-center justify-center text-gov-charcoal font-bold text-xs">
                        <FileCheckIcon size={15} />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-gov-charcoal block">
                          المفتش: {ins.inspectorName}
                        </strong>
                        <span className="text-[11px] text-gov-muted font-mono">
                          {formatDate(ins.startedAt.split("T")[0])}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-gov-canvas px-3 py-1.5 rounded border border-gov-border font-num">
                      <span className="text-gov-muted">تغير درجة الخطورة:</span>
                      <span className="font-bold text-gov-charcoal">
                        {ins.riskScoreBefore}
                      </span>
                      <span className="text-gov-border">←</span>
                      <span
                        className={`font-bold ${
                          (ins.riskScoreAfter ?? ins.riskScoreBefore) >=
                          ins.riskScoreBefore
                            ? "text-risk-critical"
                            : "text-gov-emerald"
                        }`}
                      >
                        {ins.riskScoreAfter ?? ins.riskScoreBefore}
                      </span>
                    </div>
                  </div>

                  {ins.summary && (
                    <p className="text-xs text-gov-muted leading-relaxed bg-gov-sandlight/40 p-3 rounded border border-gov-border/60">
                      {ins.summary}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer Navigation Actions ─────────────────────────────────────── */}
        <div className="pt-6 border-t border-gov-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gov-border rounded text-gov-charcoal hover:bg-gov-sandlight transition font-medium w-full sm:w-auto justify-center"
          >
            <ChevronLeftIcon size={14} />
            <span>العودة إلى لوحة التحكم الرئيسية</span>
          </Link>

          <Link
            href={`/establishments/${establishment.id}/inspect`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gov-charcoal text-white rounded font-semibold hover:bg-gov-slate transition shadow-xs w-full sm:w-auto justify-center"
          >
            <ClipboardIcon size={15} className="text-gov-sand" />
            <span>بدء الجولة التفتيشية الميدانية</span>
            <ArrowLeftIcon size={14} />
          </Link>
        </div>
      </main>
    </>
  );
}
