"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2Icon,
  CpuIcon,
  FileCheckIcon,
  LayoutDashboardIcon,
  MapIcon,
  ProductMarkIcon,
  ShieldAlertIcon,
} from "./icons";

interface SidebarNavProps {
  urgentCount?: number;
}

export function SidebarNav({ urgentCount = 3 }: SidebarNavProps) {
  const [timeString, setTimeString] = useState("10:42 ص");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "م" : "ص";
      const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
      setTimeString(`${formattedHours}:${minutes} ${period}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-full md:w-64 bg-gov-charcoal text-white flex-shrink-0 z-20 flex flex-col justify-between border-b md:border-b-0 md:border-l border-gov-slate">
      {/* Brand / Emblems Section */}
      <div>
        <div className="p-6 border-b border-gov-slate/80">
          <div className="flex items-center gap-3">
            {/* Institutional Geometric Icon */}
            <div className="w-10 h-10 rounded border border-gov-sand/20 bg-gov-slate/70 flex items-center justify-center text-gov-sand flex-shrink-0 shadow-inner">
              <ProductMarkIcon size={20} />
            </div>
            <div>
              <span className="block text-[11px] text-gov-sand/70 tracking-widest font-normal uppercase">
                منظومة الرقابة الذكية
              </span>
              <h1 className="text-base font-bold text-white tracking-wide">
                المفتش الذكي
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-sm">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded text-white bg-gov-slate border-r-2 border-gov-emerald font-medium transition-colors"
          >
            <LayoutDashboardIcon size={16} className="text-emerald-400" />
            <span>لوحة العمليات والرقابة</span>
          </Link>
          <a
            href="#madinah-map"
            className="flex items-center justify-between px-3.5 py-2.5 rounded text-gray-300 hover:text-white hover:bg-gov-slate/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MapIcon size={16} className="text-emerald-400" />
              <span>خريطة المدينة الذكية</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
              GIS
            </span>
          </a>
          <a
            href="#priority"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded text-gray-300 hover:text-white hover:bg-gov-slate/50 transition-colors"
          >
            <ShieldAlertIcon size={16} className="text-gray-400" />
            <span>قائمة الأولويات الفورية</span>
            <span className="mr-auto bg-risk-critical/30 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded font-num">
              {String(urgentCount).padStart(2, "0")}
            </span>
          </a>
          <a
            href="#establishments"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded text-gray-300 hover:text-white hover:bg-gov-slate/50 transition-colors"
          >
            <Building2Icon size={16} className="text-gray-400" />
            <span>سجل المنشآت الخاضعة</span>
          </a>
          <a
            href="#engine"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded text-gray-300 hover:text-white hover:bg-gov-slate/50 transition-colors"
          >
            <CpuIcon size={16} className="text-gray-400" />
            <span>محرك تقييم المخاطر</span>
          </a>
          <a
            href="#establishments"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded text-gray-300 hover:text-white hover:bg-gov-slate/50 transition-colors"
          >
            <FileCheckIcon size={16} className="text-gray-400" />
            <span>تقارير الجولات الميدانية</span>
          </a>
        </nav>
      </div>

      {/* Telemetry Status Card */}
      <div className="p-4 m-3 rounded border border-gov-slate bg-gov-slate/40 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gov-sand/80 font-medium">حالة المحرك الرقابي</span>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            نشط الآن
          </span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          يتم حساب معاملات المخاطر لحظيًا استنادًا لسجل المخالفات وتاريخ الزيارات.
        </p>
        <div className="mt-3 pt-2.5 border-t border-gov-slate/60 flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>الإصدار 3.2 · GovOS</span>
          <span>{timeString}</span>
        </div>
      </div>
    </aside>
  );
}
