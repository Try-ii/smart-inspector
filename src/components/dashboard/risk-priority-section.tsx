"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Establishment, Violation } from "@/types/entities";
import {
  ChevronLeftIcon,
  MapPinIcon,
  RouteIcon,
  UtensilsIcon,
  CalendarIcon,
} from "./icons";
import {
  getEstablishmentTypeLabel,
  getLatestViolation,
  getPriorityReason,
  getRiskLevelLabel,
  getViolationsForEstablishment,
} from "./view-model";

interface RiskPrioritySectionProps {
  establishments: Establishment[];
  violations: Violation[];
  onOpenDispatchModal?: (name: string, score: number, level: string) => void;
  onOpenBatchModal?: () => void;
}

export function RiskPrioritySection({
  establishments,
  violations,
  onOpenDispatchModal,
  onOpenBatchModal,
}: RiskPrioritySectionProps) {
  const featured = establishments[0];
  const queue = establishments.slice(1, 4);

  const featuredViolations = featured
    ? getViolationsForEstablishment(violations, featured.id)
    : [];
  const featuredLatest = getLatestViolation(featuredViolations);
  const featuredRepeatCount = featuredViolations.filter((v) => v.isRepeat).length;

  const targetScore = featured ? featured.currentRiskScore : 90;
  const [animScore, setAnimScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(213.6);

  useEffect(() => {
    const circumference = 2 * Math.PI * 34; // 213.6
    const offset = circumference - (targetScore / 100) * circumference;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setAnimScore(targetScore);
      setDashOffset(offset);
      return;
    }

    setDashOffset(circumference);
    setAnimScore(0);

    const timeout = setTimeout(() => {
      setDashOffset(offset);

      let current = 0;
      const duration = 900;
      const stepTime = 20;
      const increment = targetScore / (duration / stepTime);

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setAnimScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimScore(Math.floor(current));
        }
      }, stepTime);
    }, 150);

    return () => clearTimeout(timeout);
  }, [targetScore]);

  const getGaugeStrokeColor = (score: number) => {
    if (score >= 80) return "#9E2A2B";
    if (score >= 60) return "#B85D1B";
    if (score >= 30) return "#8C6F1E";
    return "#266E57";
  };

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
    <section className="mb-12 seq-priority" id="priority">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald tracking-wide mb-1">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>التوجيه الرقابي الآلي والتكليف الفوري</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gov-charcoal">
            المنشآت التي تستحق انتباه المفتش الآن
          </h2>
        </div>
        <p className="text-xs text-gov-muted">
          مرتبة تلقائيًا حسب درجة الخطورة وسجل المخالفات والتكرار الزمني.
        </p>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* #1 PRIMARY INTELLIGENCE CARD (INTELLIGENCE DOSSIER STAR) */}
        {featured && (
          <div className="lg:col-span-8 bg-white border border-gov-border rounded-md gov-card-shadow overflow-hidden">
            {/* Top Rank Bar */}
            <div className="bg-gov-sandlight/80 px-5 py-3 border-b border-gov-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold bg-gov-charcoal text-gov-sandlight px-2.5 py-0.5 rounded font-num border border-gov-slate">
                  الأولوية #01
                </span>
                <span className="text-xs text-gov-muted">
                  الرمز الرقابي:{" "}
                  <span className="font-mono text-gov-charcoal font-bold">
                    {featured.licenseNumber}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded border ${getRiskBadgeStyles(
                    featured.riskLevel,
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-critical animate-pulse" />
                  {getRiskLevelLabel(featured.riskLevel)}
                </span>
              </div>
            </div>

            {/* Establishment Core Data + Risk Score Gauge Visualization */}
            <div className="p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gov-border">
                <div className="space-y-2">
                  <div className="text-[11px] text-gov-muted font-medium">
                    الاسم التجاري والنشاط الخاضع للتفتيش
                  </div>
                  <h3 className="text-2xl md:text-[27px] font-bold text-gov-charcoal tracking-tight">
                    {featured.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gov-muted pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <MapPinIcon size={14} className="text-gov-emerald" />
                      {featured.district}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UtensilsIcon size={14} className="text-gov-emerald" />
                      {getEstablishmentTypeLabel(featured.type)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-gov-emerald" />
                      آخر زيارة: {featured.lastInspectionDate}
                    </span>
                  </div>
                </div>

                {/* Refined Circular Risk Gauge with Mini Escalation Trend */}
                <div className="flex flex-col gap-2 self-start md:self-auto bg-gov-canvas p-3.5 rounded border border-gov-border flex-shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-20 h-20 transform -rotate-90"
                        viewBox="0 0 80 80"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#E2DDD2"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke={getGaugeStrokeColor(targetScore)}
                          strokeWidth="6"
                          strokeDasharray="213.6"
                          strokeDashoffset={dashOffset}
                          fill="transparent"
                          className="gauge-circle"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-gov-charcoal font-num leading-none">
                          {animScore}
                        </span>
                        <span className="text-[9px] text-gov-muted font-mono mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-gov-muted font-medium">
                        مؤشر المخاطر التراكمي
                      </div>
                      <div className="text-xs font-bold text-risk-critical">
                        {featured.riskLevel === "critical"
                          ? "مستوى الخطر حرج"
                          : "مستوى الخطر مرتفع"}
                      </div>
                      <div className="text-[10px] text-gov-muted font-num">
                        +42% أعلى من متوسط الحي
                      </div>
                    </div>
                  </div>

                  {/* Mini Risk Escalation Stepper / Trend Indicator */}
                  <div className="pt-2 border-t border-gov-border/80 flex items-center justify-between text-[10px]">
                    <span className="text-gov-muted font-medium">
                      تصاعد مؤشر المخاطر:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                      <span className="text-gov-subtle font-num">48</span>
                      <span className="text-gov-border">→</span>
                      <span className="text-risk-medium font-num">62</span>
                      <span className="text-gov-border">→</span>
                      <span className="text-risk-high font-num">78</span>
                      <span className="text-gov-border">→</span>
                      <span className="text-risk-critical bg-risk-criticalBg px-1 rounded font-num">
                        {targetScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameters Breakdown Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-b border-gov-border text-xs">
                <div>
                  <span className="text-gov-muted block text-[11px]">
                    المخالفات السابقة:
                  </span>
                  <span className="font-bold text-gov-charcoal text-sm mt-0.5 block font-num">
                    {String(featuredViolations.length).padStart(2, "0")} مخالفات
                  </span>
                </div>
                <div>
                  <span className="text-gov-muted block text-[11px]">
                    المخالفات المتكررة:
                  </span>
                  <span className="font-bold text-risk-critical text-sm mt-0.5 block font-num">
                    {String(featuredRepeatCount).padStart(2, "0")}{" "}
                    {featuredRepeatCount > 0 ? "(تكرار عالي)" : "(لا يوجد)"}
                  </span>
                </div>
                <div>
                  <span className="text-gov-muted block text-[11px]">
                    تاريخ آخر مخالفة:
                  </span>
                  <span className="font-bold text-gov-charcoal text-sm mt-0.5 block">
                    {featuredLatest ? "منذ 14 يوماً" : "لا توجد"}
                  </span>
                </div>
                <div>
                  <span className="text-gov-muted block text-[11px]">
                    تصنيف الحساسية:
                  </span>
                  <span className="font-bold text-gov-charcoal text-sm mt-0.5 block">
                    حساسية غذائية قصوى
                  </span>
                </div>
              </div>

              {/* Structured Intelligence Reasoning */}
              <div className="pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gov-emerald/15 flex items-center justify-center text-gov-emerald">
                      <svg
                        className="w-2.5 h-2.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-bold text-gov-charcoal">
                      تحليل النظام الرقابي الذكي: لماذا تستحق التدخل الفوري؟
                    </h4>
                  </div>
                  <span className="text-[10px] text-gov-muted font-mono font-medium">
                    تسلسل التحليل الموجه
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-4 h-4 rounded bg-gov-charcoal text-white text-[9px] font-bold flex items-center justify-center font-num">
                        01
                      </span>
                      <span className="font-bold text-gov-charcoal">
                        حساسية النشاط
                      </span>
                    </div>
                    <p className="text-gov-muted text-[11px] leading-relaxed">
                      رصد انحراف متكرر في درجات حرارة حفظ اللحوم والدواجن في
                      الزيارات السابقة.
                    </p>
                  </div>
                  <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-4 h-4 rounded bg-gov-charcoal text-white text-[9px] font-bold flex items-center justify-center font-num">
                        02
                      </span>
                      <span className="font-bold text-gov-charcoal">
                        تكرار المخالفات
                      </span>
                    </div>
                    <p className="text-gov-muted text-[11px] leading-relaxed">
                      عدم تصحيح ملاحظات النظافة الهيكلية وأجهزة التعقيم خلال المهلة
                      النظامية.
                    </p>
                  </div>
                  <div className="p-3 bg-gov-canvas rounded border border-gov-border">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-4 h-4 rounded bg-gov-charcoal text-white text-[9px] font-bold flex items-center justify-center font-num">
                        03
                      </span>
                      <span className="font-bold text-gov-charcoal">
                        ارتفاع مؤشر المخاطر
                      </span>
                    </div>
                    <p className="text-gov-muted text-[11px] leading-relaxed">
                      المنشأة تخدم إعاشة كبرى مما يرفع معامل الخطر والأثر الصحي إلى{" "}
                      {targetScore}/100.
                    </p>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-3.5 rounded bg-gov-sandlight/80 border-r-4 border-gov-charcoal text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-gov-charcoal block">
                      توصية المحرك الرقابي:
                    </span>
                    <p className="text-gov-muted text-[11px] mt-0.5 leading-relaxed">
                      {getPriorityReason(featured, featuredViolations)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/establishments/${featured.id}`}
                      className="px-4 py-2 bg-gov-charcoal text-white rounded font-semibold hover:bg-gov-slate transition duration-150 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shadow-xs text-xs flex-shrink-0"
                    >
                      بدء التفتيش الآن
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBSEQUENT PRIORITY QUEUE (#2, #3, #4) */}
        <div className="lg:col-span-4 space-y-3 seq-queue">
          <div className="px-1 flex items-center justify-between text-xs font-semibold text-gov-muted">
            <span>قائمة الانتظار الرقابي التالي</span>
            <span className="text-[11px] font-mono text-gov-emerald">
              محدثة حسب الأثر
            </span>
          </div>

          {queue.map((establishment, index) => {
            const estViolations = getViolationsForEstablishment(
              violations,
              establishment.id,
            );
            const latest = getLatestViolation(estViolations);
            const rankStr = String(index + 2).padStart(2, "0");

            return (
              <div
                key={establishment.id}
                onClick={() => {
                  if (onOpenDispatchModal) {
                    onOpenDispatchModal(
                      establishment.name,
                      establishment.currentRiskScore,
                      getRiskLevelLabel(establishment.riskLevel),
                    );
                  }
                }}
                className="queue-row bg-white p-3.5 rounded-md border border-gov-border cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-num text-gov-charcoal bg-gov-sandlight px-2 py-0.5 rounded">
                    #{rankStr}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border font-num ${getRiskBadgeStyles(
                      establishment.riskLevel,
                    )}`}
                  >
                    {establishment.currentRiskScore} / 100
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gov-charcoal">
                  {establishment.name}
                </h4>
                <p className="text-xs text-gov-muted mt-0.5">
                  {establishment.district} · {getEstablishmentTypeLabel(establishment.type)}
                </p>
                <div className="mt-2.5 pt-2 border-t border-gov-borderLight flex items-center justify-between text-[11px] text-gov-muted">
                  <span>
                    آخر مخالفة: {latest ? "منذ 18 يوماً" : "لا توجد"}
                  </span>
                  <Link
                    href={`/establishments/${establishment.id}`}
                    className="text-gov-emerald font-semibold flex items-center gap-0.5 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>تفاصيل</span>
                    <ChevronLeftIcon size={12} />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Direct Queue Action */}
          <button
            onClick={onOpenBatchModal}
            type="button"
            className="w-full py-2.5 bg-gov-canvas hover:bg-gov-sandlight border border-gov-border text-xs text-gov-charcoal font-semibold rounded transition duration-150 flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-xs cursor-pointer"
          >
            <RouteIcon size={14} className="text-gov-emerald" />
            <span>توليد مسار جولة متسلسلة للمنشآت الـ 4</span>
          </button>
        </div>
      </div>
    </section>
  );
}
