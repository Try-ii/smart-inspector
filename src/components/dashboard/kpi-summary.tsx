"use client";

import React, { useEffect, useState } from "react";
import type { Establishment, Violation } from "@/types/entities";

interface KpiSummaryProps {
  establishments: Establishment[];
  violations: Violation[];
}

export function KpiSummary({ establishments, violations }: KpiSummaryProps) {
  const totalCount = establishments.length;
  const highRiskCount = establishments.filter(
    (e) => e.riskLevel === "high" || e.riskLevel === "critical",
  ).length;
  const readyCount = establishments.filter((e) => e.currentRiskScore >= 60).length;
  const repeatCount = violations.filter((v) => v.isRepeat).length;

  const [animTotal, setAnimTotal] = useState(0);
  const [animHigh, setAnimHigh] = useState(0);
  const [animReady, setAnimReady] = useState(0);
  const [animRepeat, setAnimRepeat] = useState(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setAnimTotal(totalCount);
      setAnimHigh(highRiskCount);
      setAnimReady(readyCount);
      setAnimRepeat(repeatCount);
      return;
    }

    const duration = 600;
    const stepTime = 25;
    const steps = duration / stepTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimTotal(Math.round(totalCount * eased));
      setAnimHigh(Math.round(highRiskCount * eased));
      setAnimReady(Math.round(readyCount * eased));
      setAnimRepeat(Math.round(repeatCount * eased));

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [totalCount, highRiskCount, readyCount, repeatCount]);

  const padNum = (num: number) => String(num).padStart(2, "0");

  return (
    <>
      {/* SECTION 2: EXECUTIVE KPI STRIP */}
      <section className="mb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gov-border border border-gov-border py-4 px-2 bg-white rounded-md gov-card-shadow">
          {/* Metric 1 */}
          <div className="px-5 py-1.5 seq-kpi-1">
            <div className="text-3xl md:text-[38px] font-bold text-gov-charcoal font-num leading-tight">
              {padNum(animTotal)}
            </div>
            <div className="mt-1 text-xs font-bold text-gov-charcoal">
              إجمالي المنشآت
            </div>
            <div className="text-[11px] text-gov-muted mt-0.5">
              ضمن نطاق الرقابة والتتبع
            </div>
          </div>

          {/* Metric 2 */}
          <div className="px-5 py-1.5 seq-kpi-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-[38px] font-bold text-risk-critical font-num leading-tight">
                {padNum(animHigh)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-risk-criticalBg text-risk-critical border border-risk-criticalBorder">
                مستعجلة
              </span>
            </div>
            <div className="mt-1 text-xs font-bold text-gov-charcoal">
              منشآت عالية الخطورة
            </div>
            <div className="text-[11px] text-gov-muted mt-0.5">
              تتطلب التدخل الميداني الفوري
            </div>
          </div>

          {/* Metric 3 */}
          <div className="px-5 py-1.5 seq-kpi-3">
            <div className="text-3xl md:text-[38px] font-bold text-gov-emerald font-num leading-tight">
              {padNum(animReady)}
            </div>
            <div className="mt-1 text-xs font-bold text-gov-charcoal">
              أولوية تفتيشية
            </div>
            <div className="text-[11px] text-gov-muted mt-0.5">
              جاهزة للإسناد المباشر للفرق
            </div>
          </div>

          {/* Metric 4 */}
          <div className="px-5 py-1.5 seq-kpi-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-[38px] font-bold text-risk-high font-num leading-tight">
                {padNum(animRepeat)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-risk-highBg text-risk-high border border-risk-highBorder">
                تكراري
              </span>
            </div>
            <div className="mt-1 text-xs font-bold text-gov-charcoal">
              مخالفات متكررة
            </div>
            <div className="text-[11px] text-gov-muted mt-0.5">
              تستدعي التحقق وتطبيق الجزاءات
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: REFINED TELEMETRY STRIP */}
      <section className="mb-9 seq-status">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-2.5 bg-gov-sandlight/70 border border-gov-border rounded-md text-xs text-gov-muted">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-600 status-pulse" />
            <span className="font-bold text-gov-charcoal">
              محرك تقييم المخاطر الرقابي:
            </span>
            <span>
              آخر تحليل:{" "}
              <span className="font-mono text-gov-charcoal font-semibold">
                09:42 ص
              </span>
            </span>
            <span className="text-gov-border">·</span>
            <span>
              <strong className="text-gov-charcoal font-num">
                {padNum(totalCount)}
              </strong>{" "}
              منشآت محللة ومطابقة مع اللائحة
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="font-bold text-gov-emerald bg-gov-canvas px-2 py-0.5 rounded border border-gov-border font-num">
              {padNum(readyCount)} مرشحة للجولة الفورية
            </span>
            <span className="text-gov-border">|</span>
            <span className="font-mono text-gov-subtle">Engine v3.2</span>
          </div>
        </div>
      </section>
    </>
  );
}
