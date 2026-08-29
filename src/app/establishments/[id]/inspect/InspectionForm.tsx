"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  Establishment,
  Violation,
  ViolationCategory,
  ViolationSeverity,
} from "@/types/entities";
import { DEMO_EVIDENCE_OPTIONS } from "@/lib/ai-fallback";
import {
  AlertIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  InspectorIcon,
  RepeatIcon,
  ShieldAlertIcon,
  SparkleIcon,
} from "@/components/dashboard/icons";

// ─── Label maps ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ViolationCategory, string> = {
  food_storage: "تخزين الأغذية",
  hygiene: "النظافة العامة",
  expired_product: "منتجات منتهية الصلاحية",
  fire_safety: "السلامة من الحريق",
  pest_control: "مكافحة الآفات",
};

const SEVERITY_LABELS: Record<ViolationSeverity, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const CATEGORIES: ViolationCategory[] = [
  "food_storage",
  "hygiene",
  "expired_product",
  "fire_safety",
  "pest_control",
];

const SEVERITIES: ViolationSeverity[] = ["low", "medium", "high", "critical"];

// ─── Analysis Stages ─────────────────────────────────────────────────────────

const ANALYSIS_STAGES = [
  { id: 1, label: "تحليل محتوى الدليل" },
  { id: 2, label: "تصنيف المخالفة المحتملة" },
  { id: 3, label: "مطابقة السجل والاشتراطات" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface InspectionFormProps {
  establishment: Establishment;
  existingViolations: Violation[];
  riskScore: number;
  riskLevel: string;
}

export function InspectionForm({
  establishment,
  existingViolations,
  riskScore,
  riskLevel,
}: InspectionFormProps) {
  const router = useRouter();

  // Form state
  const [inspectorName, setInspectorName] = useState("أحمد العتيبي");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [category, setCategory] = useState<ViolationCategory>("food_storage");
  const [severity, setSeverity] = useState<ViolationSeverity>("high");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [hasViolation, setHasViolation] = useState(true);

  // AI Analysis Transition state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeSuggestionEvidenceId, setActiveSuggestionEvidenceId] = useState<string | null>(null);

  // Sequence ref to prevent race conditions on quick switching
  const analysisSeqRef = useRef<number>(0);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup pending timers on unmount
  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // ── Evidence selection with smooth analysis transition (~1.4s) ───────────

  function handleEvidenceSelect(evidenceId: string) {
    // If user clicks the currently selected evidence to deselect
    if (selectedEvidenceId === evidenceId) {
      analysisSeqRef.current += 1;
      activeTimersRef.current.forEach((t) => clearTimeout(t));
      activeTimersRef.current = [];
      setSelectedEvidenceId(null);
      setIsAnalyzing(false);
      setAnalysisStep(0);
      setAnalysisProgress(0);
      setActiveSuggestionEvidenceId(null);
      return;
    }

    const option = DEMO_EVIDENCE_OPTIONS.find((e) => e.id === evidenceId);
    if (!option) return;

    // Invalidate any previous running analysis timers
    analysisSeqRef.current += 1;
    const currentSeq = analysisSeqRef.current;
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];

    // Step 1: Immediate selection feedback & start analysis
    setSelectedEvidenceId(evidenceId);
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisProgress(25);
    setActiveSuggestionEvidenceId(null);

    // Step 2: Stage 2 transition at 450ms (تصنيف المخالفة المحتملة)
    const timer1 = setTimeout(() => {
      if (analysisSeqRef.current !== currentSeq) return;
      setAnalysisStep(2);
      setAnalysisProgress(60);
    }, 450);

    // Step 3: Stage 3 transition at 900ms (مطابقة السجل والاشتراطات)
    const timer2 = setTimeout(() => {
      if (analysisSeqRef.current !== currentSeq) return;
      setAnalysisStep(3);
      setAnalysisProgress(88);
    }, 900);

    // Step 4: Completion transition at 1350ms (اكتمل التحليل وعرض الاقتراح)
    const timer3 = setTimeout(() => {
      if (analysisSeqRef.current !== currentSeq) return;
      setAnalysisProgress(100);
      setIsAnalyzing(false);
      setActiveSuggestionEvidenceId(evidenceId);

      // Auto-fill form fields from deterministic suggestion
      setCategory(option.suggestion.category);
      setSeverity(option.suggestion.severity);
      setDescription(option.suggestion.description);
    }, 1350);

    activeTimersRef.current = [timer1, timer2, timer3];
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!inspectorName.trim()) {
      setError("يرجى إدخال اسم المفتش المسؤول عن الجولة.");
      return;
    }

    if (hasViolation && !description.trim()) {
      setError("يرجى إدخال وصف المخالفة المرصودة.");
      return;
    }

    const payload = {
      establishmentId: establishment.id,
      inspectorName: inspectorName.trim(),
      ...(hasViolation
        ? {
            violation: {
              category,
              severity,
              description:
                description.trim() +
                (notes.trim() ? ` — ملاحظات المفتش: ${notes.trim()}` : ""),
              evidenceId: selectedEvidenceId ?? undefined,
            },
          }
        : {}),
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        return;
      }

      const data = (await res.json()) as { inspection: { id: string } };
      router.push(`/inspections/${data.inspection.id}`);
    } catch {
      setError("تعذر الاتصال بالخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEvidence = DEMO_EVIDENCE_OPTIONS.find(
    (e) => e.id === (activeSuggestionEvidenceId ?? selectedEvidenceId),
  );

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
    <form onSubmit={handleSubmit} noValidate className="space-y-8 pb-12">
      {/* ── SECTION 1: ESTABLISHMENT CONTEXT & INSPECTOR ─────────────────────── */}
      <section className="bg-white border border-gov-border rounded-md gov-card-shadow p-6 md:p-7">
        <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-2">
          <InspectorIcon size={15} />
          <span>بيانات الجولة وسياق المنشأة</span>
        </div>
        <h2 className="text-lg font-bold text-gov-charcoal mb-4">
          معلومات المفتش والمؤشرات الراهنة
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-3">
            <div>
              <label
                htmlFor="inspector-name"
                className="block text-xs font-bold text-gov-charcoal mb-1.5"
              >
                اسم المفتش الميداني:
              </label>
              <input
                id="inspector-name"
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                required
                className="w-full text-xs bg-gov-canvas border border-gov-border rounded p-2.5 text-gov-charcoal font-semibold focus:outline-none focus:border-gov-emerald"
              />
            </div>
            <p className="text-[11px] text-gov-muted">
              المفتش المسند إليه أمر المهمة الرقابية المعتمد.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  درجة الخطورة:
                </span>
                <strong className="font-bold text-gov-charcoal text-base block font-num mt-0.5">
                  {riskScore} / 100
                </strong>
              </div>
              <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  مستوى الخطورة:
                </span>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold border mt-0.5 ${getRiskBadgeStyles(
                    riskLevel,
                  )}`}
                >
                  {riskLevel === "critical"
                    ? "حرجة"
                    : riskLevel === "high"
                    ? "عالية"
                    : riskLevel === "medium"
                    ? "متوسطة"
                    : "منخفضة"}
                </span>
              </div>
              <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  المخالفات السابقة:
                </span>
                <strong className="font-bold text-gov-charcoal text-base block font-num mt-0.5">
                  {existingViolations.length}
                </strong>
              </div>
              <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                <span className="text-gov-muted block text-[11px]">
                  تكرار سابق:
                </span>
                <strong className="font-bold text-risk-critical text-base block font-num mt-0.5">
                  {existingViolations.filter((v) => v.isRepeat).length}
                </strong>
              </div>
            </div>

            {existingViolations.length > 0 && (
              <div className="mt-3 p-2.5 bg-gov-sandlight/60 border border-gov-border rounded text-[11px] text-gov-muted flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gov-charcoal font-medium">
                  <RepeatIcon size={12} className="text-risk-high" />
                  آخر مخالفة مسجلة:{" "}
                  {existingViolations[0]?.description.slice(0, 45)}...
                </span>
                <span className="font-mono text-gov-subtle">
                  {existingViolations[0]?.date}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: AI EVIDENCE & DECISION SUPPORT ───────────────────────── */}
      <section className="bg-white border border-gov-border rounded-md gov-card-shadow p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald">
            <SparkleIcon size={15} />
            <span>منظومة الذكاء الاصطناعي لمساندة المفتش</span>
          </div>
          <span className="text-xs text-gov-muted font-mono">
            اقتراح آلي استرشادي
          </span>
        </div>

        <h2 className="text-lg font-bold text-gov-charcoal mb-1.5">
          الأدلة الميدانية وتحليل النظام الذكي
        </h2>
        <p className="text-xs text-gov-muted mb-5 leading-relaxed">
          اختر أحد سيناريوهات الأدلة المصورة لتفعيل التحليل الذكي واقتراح التوصية
          التفتيشية تلقائياً.
        </p>

        {/* Evidence Selector Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {DEMO_EVIDENCE_OPTIONS.map((opt) => {
            const isSelected = selectedEvidenceId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleEvidenceSelect(opt.id)}
                className={`text-right p-4 rounded-md border transition duration-150 cursor-pointer relative ${
                  isSelected
                    ? "border-gov-emerald bg-gov-sandlight/80 shadow-xs ring-1 ring-gov-emerald"
                    : "border-gov-border bg-gov-canvas hover:bg-gov-sandlight/40 hover:border-gov-sand"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base" aria-hidden="true">
                    {opt.id.startsWith("food")
                      ? "🌡️"
                      : opt.id.startsWith("hygiene")
                      ? "🧹"
                      : opt.id.startsWith("expired")
                      ? "📦"
                      : opt.id.startsWith("fire")
                      ? "🚨"
                      : "🐛"}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gov-emerald bg-white px-2 py-0.5 rounded border border-gov-emerald/40 font-mono">
                      {isAnalyzing ? "جارٍ التحليل..." : "✓ محدد"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gov-muted font-mono">
                      دليل تجريبي
                    </span>
                  )}
                </div>

                <strong className="text-xs font-bold text-gov-charcoal block mb-1">
                  {opt.label}
                </strong>
                <p className="text-[11px] text-gov-muted leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── AI ANALYSIS LOADING & TRANSITION STATE ── */}
        {isAnalyzing ? (
          <div className="bg-gov-sandlight/80 border-2 border-gov-emerald/40 rounded-md p-6 relative overflow-hidden transition-all duration-300">
            {/* Top Analysis Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gov-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gov-emerald text-white flex items-center justify-center animate-spin">
                  <SparkleIcon size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gov-charcoal block">
                    جارٍ تحليل الدليل الميداني ومطابقة الاشتراطات...
                  </span>
                  <span className="text-[11px] text-gov-muted">
                    يقوم محرك المفتش الذكي بتحليل المؤشرات وتوليد التوصية الرقابية استرشادياً
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-white text-gov-emerald border border-gov-emerald/30 font-mono">
                  {analysisProgress}% مكتمل
                </span>
              </div>
            </div>

            {/* Stage Pipeline Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
              {ANALYSIS_STAGES.map((stg) => {
                const isCurrent = analysisStep === stg.id;
                const isPassed = analysisStep > stg.id;
                return (
                  <div
                    key={stg.id}
                    className={`p-2.5 rounded border text-xs flex items-center gap-2 transition duration-200 ${
                      isPassed
                        ? "bg-white border-gov-emerald text-gov-emerald font-semibold"
                        : isCurrent
                        ? "bg-white border-gov-emerald text-gov-charcoal font-bold shadow-xs"
                        : "bg-gov-canvas/60 border-gov-border text-gov-muted"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isPassed
                          ? "bg-gov-emerald text-white"
                          : isCurrent
                          ? "bg-gov-emerald/20 text-gov-emerald border border-gov-emerald animate-pulse"
                          : "bg-gov-sandlight text-gov-muted"
                      }`}
                    >
                      {isPassed ? "✓" : stg.id}
                    </span>
                    <span className="text-[11px]">{stg.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-gov-border/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gov-emerald h-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        ) : activeSuggestionEvidenceId && selectedEvidence ? (
          /* ── COMPLETED AI SUGGESTION DOSSIER BOX ── */
          <div className="bg-gov-sandlight/70 border-2 border-gov-emerald/30 rounded-md p-5 relative overflow-hidden transition-all duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-gov-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gov-emerald text-white flex items-center justify-center text-xs">
                  <SparkleIcon size={13} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gov-charcoal block">
                    اقتراح المفتش الذكي (مساندة اتخاذ القرار)
                  </span>
                  <span className="text-[10px] text-gov-muted">
                    اكتمل التحليل: تم تحليل الدليل وتوليد التوصية وفق لائحة الاشتراطات
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-gov-emerald border border-gov-emerald/40 font-mono">
                  نسبة الثقة:{" "}
                  {Math.round((selectedEvidence.suggestion.confidence ?? 0) * 100)}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getSeverityBadgeStyles(
                    severity,
                  )}`}
                >
                  درجة الخطورة: {SEVERITY_LABELS[severity]}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gov-charcoal text-gov-sandlight border border-gov-slate">
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-gov-border text-xs text-gov-charcoal mb-3 leading-relaxed">
              <span className="text-gov-muted block text-[11px] mb-1 font-semibold">
                التوصية الآلية المقترحة:
              </span>
              {description}
            </div>

            <div className="text-[11px] text-gov-muted flex items-center gap-2">
              <CheckCircleIcon size={14} className="text-gov-emerald flex-shrink-0" />
              <span>
                هذا الاقتراح استرشادي لمساندة القرار؛ للمفتش الميداني كامل الصلاحية
                في تعديل الوصف أو التصنيف أدناه قبل الاعتماد النهائي.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gov-canvas rounded border border-dashed border-gov-border text-center text-xs text-gov-muted">
            💡 اضغط على أي بطاقة من الأدلة أعلاه لتفعيل التحليل الذكي وملء نموذج
            المخالفة تلقائياً.
          </div>
        )}
      </section>

      {/* ── SECTION 3: INSPECTOR REVIEW & RECORDING ─────────────────────────── */}
      <section className="bg-white border border-gov-border rounded-md gov-card-shadow p-6 md:p-7">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-gov-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
              <ClipboardCheckIcon size={14} />
              <span>قرار المفتش واعتماد المخالفة</span>
            </div>
            <h2 className="text-lg font-bold text-gov-charcoal">
              تسجيل بيانات المخالفة المعتمدة
            </h2>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-bold text-gov-charcoal bg-gov-sandlight/70 px-3 py-1.5 rounded border border-gov-border cursor-pointer">
            <input
              type="checkbox"
              checked={hasViolation}
              onChange={(e) => setHasViolation(e.target.checked)}
              className="rounded text-gov-emerald focus:ring-0"
            />
            <span>رُصدت مخالفة خلال هذه الجولة</span>
          </label>
        </div>

        {hasViolation ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="violation-category"
                  className="block font-bold text-gov-charcoal mb-1.5"
                >
                  تصنيف المخالفة:
                </label>
                <select
                  id="violation-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ViolationCategory)
                  }
                  className="w-full bg-gov-canvas border border-gov-border rounded p-2.5 text-gov-charcoal font-medium focus:outline-none focus:border-gov-emerald"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="violation-severity"
                  className="block font-bold text-gov-charcoal mb-1.5"
                >
                  درجة الخطورة المعتمدة:
                </label>
                <select
                  id="violation-severity"
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as ViolationSeverity)
                  }
                  className="w-full bg-gov-canvas border border-gov-border rounded p-2.5 text-gov-charcoal font-medium focus:outline-none focus:border-gov-emerald"
                >
                  {SEVERITIES.map((sev) => (
                    <option key={sev} value={sev}>
                      {SEVERITY_LABELS[sev]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="violation-description"
                className="block font-bold text-gov-charcoal mb-1.5"
              >
                وصف المخالفة الميدانية <span className="text-risk-critical">*</span>:
              </label>
              <textarea
                id="violation-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={hasViolation}
                placeholder="أدخل وصفاً موضوعياً ومفصلاً للمخالفة المرصودة..."
                className="w-full bg-white border border-gov-border rounded p-3 text-gov-charcoal placeholder-gov-muted focus:outline-none focus:border-gov-emerald leading-relaxed"
              />
            </div>

            <div>
              <label
                htmlFor="inspector-notes"
                className="block font-bold text-gov-charcoal mb-1.5"
              >
                ملاحظات وتوجيهات المفتش الإضافية (اختياري):
              </label>
              <textarea
                id="inspector-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية حول التجاوب الميداني أو مهلة التصحيح..."
                className="w-full bg-white border border-gov-border rounded p-2.5 text-gov-charcoal placeholder-gov-muted focus:outline-none focus:border-gov-emerald"
              />
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gov-canvas rounded border border-gov-border text-center text-xs text-gov-muted">
            ✓ تم تحديد الجولة كـ "منشأة ممتثلة" بدون رصد مخالفات. سيتم تحديث
            تاريخ آخر زيارة وخفض معامل التأخير.
          </div>
        )}
      </section>

      {/* ── Error Message ─────────────────────────────────────────────────── */}
      {error && (
        <div
          className="p-3.5 bg-risk-criticalBg border border-risk-criticalBorder text-risk-critical rounded-md text-xs flex items-center gap-2 font-medium"
          role="alert"
        >
          <AlertIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Action Buttons ─────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-gov-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <Link
          href={`/establishments/${establishment.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gov-border rounded text-gov-charcoal hover:bg-gov-sandlight transition font-medium w-full sm:w-auto justify-center"
        >
          <ChevronLeftIcon size={14} />
          <span>إلغاء والعودة لملف المنشأة</span>
        </Link>

        <button
          type="submit"
          disabled={submitting || isAnalyzing}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gov-charcoal text-white rounded font-bold hover:bg-gov-slate transition shadow-sm w-full sm:w-auto cursor-pointer disabled:opacity-60"
        >
          <ClipboardCheckIcon size={16} className="text-gov-sand" />
          <span>
            {submitting
              ? "جارٍ إرسال التقرير وحساب المخاطر…"
              : "إتمام الجولة وإنشاء التقرير التفتيشي"}
          </span>
          <ArrowLeftIcon size={14} />
        </button>
      </div>
    </form>
  );
}
