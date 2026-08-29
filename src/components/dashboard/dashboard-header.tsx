"use client";

import React, { useState } from "react";
import { RefreshCwIcon, SendIcon } from "./icons";

interface DashboardHeaderProps {
  onRecalculate?: () => void;
  onOpenDispatch?: () => void;
}

export function DashboardHeader({
  onRecalculate,
  onOpenDispatch,
}: DashboardHeaderProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("09:42 ص");

  const handleRefresh = () => {
    setIsSpinning(true);
    if (onRecalculate) {
      onRecalculate();
    }
    setTimeout(() => {
      setIsSpinning(false);
      setLastUpdatedTime("الآن");
    }, 800);
  };

  return (
    <header className="mb-7 pb-6 border-b border-gov-border seq-header">
      {/* Institutional Topline Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-gov-muted mb-3.5">
        <div className="flex items-center gap-2 tracking-wide">
          <span className="font-semibold text-gov-charcoal">
            المملكة العربية السعودية
          </span>
          <span className="text-gov-border">/</span>
          <span>منطقة المدينة المنورة</span>
          <span className="text-gov-border">/</span>
          <span className="text-gov-emerald font-semibold">
            منظومة الرقابة البلدية الذكية
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gov-charcoal text-[11px] bg-gov-sandlight/90 px-3 py-1 rounded border border-gov-border shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 status-pulse" />
            <span className="font-semibold">المحرك الرقابي نشط</span>
          </div>
          <span className="text-gov-subtle text-[11px] font-mono">
            آخر رصد:{" "}
            <span className="text-gov-muted font-sans font-medium">
              {lastUpdatedTime}
            </span>
          </span>
        </div>
      </div>

      {/* Main Display Title & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-gov-charcoal tracking-tight leading-none">
              المفتش الذكي
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold uppercase bg-gov-charcoal text-gov-sandlight border border-gov-slate">
              SMART INSPECTOR
            </span>
          </div>
          <p className="mt-2.5 text-sm md:text-base text-gov-muted max-w-2xl leading-relaxed font-normal">
            منصة رقابية ذكية لتوجيه الجولات التفتيشية الميدانية نحو المنشآت الأعلى
            خطورة لرفع كفاءة الامتثال وحماية الصحة العامة.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleRefresh}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gov-charcoal bg-white hover:bg-gov-sandlight border border-gov-border rounded shadow-xs transition duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <RefreshCwIcon
              size={14}
              className={`text-gov-emerald ${isSpinning ? "animate-spin" : ""}`}
            />
            <span>إعادة تشغيل المحرك</span>
          </button>
          <button
            onClick={onOpenDispatch}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gov-charcoal hover:bg-gov-slate border border-gov-slate rounded shadow-xs transition duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <SendIcon size={14} className="text-gov-sand" />
            <span>إسناد جولة فورية</span>
          </button>
        </div>
      </div>
    </header>
  );
}
