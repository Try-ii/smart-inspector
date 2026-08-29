"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MadinahMap } from "@/components/dashboard/madinah-map";
import { EstablishmentsTable } from "@/components/dashboard/establishments-table";
import { KpiSummary } from "@/components/dashboard/kpi-summary";
import { RiskDistribution } from "@/components/dashboard/risk-distribution";
import { RiskPrioritySection } from "@/components/dashboard/risk-priority-section";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DispatchModal } from "@/components/dashboard/dispatch-modal";
import { Toast } from "@/components/dashboard/toast";
import type { Establishment, Violation } from "@/types/entities";

interface DashboardViewProps {
  establishments: Establishment[];
  sortedEstablishments: Establishment[];
  violations: Violation[];
}

export function DashboardView({
  establishments,
  sortedEstablishments,
  violations,
}: DashboardViewProps) {
  const router = useRouter();

  // Modal and Toast interactive state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState("");
  const [modalPriority, setModalPriority] = useState("");
  const [isBatchModal, setIsBatchModal] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenDispatch = (
    name = "مطاعم ومطابخ النور المركزية",
    score = 90,
    level = "حرجة",
  ) => {
    setModalTarget(name);
    setModalPriority(`مستوى ${level} (${score}/100)`);
    setIsBatchModal(false);
    setIsModalOpen(true);
  };

  const handleOpenBatch = () => {
    setModalTarget("4 منشآت (مطاعم النور · البركة · الساحل · طيبة)");
    setModalPriority("أولوية قصوى (مسار مجمع)");
    setIsBatchModal(true);
    setIsModalOpen(true);
  };

  const handleConfirmDispatch = (targetName: string) => {
    showToast(`تم إسناد الجولة بنجاح: ${targetName}`);
  };

  const handleRecalculate = () => {
    showToast("جارٍ تشغيل محرك تقييم المخاطر وتحديث الأوزان النسبية...");
    router.refresh();
    setTimeout(() => {
      showToast("اكتمل التحليل: تم تحديث درجات الخطورة وإعادة ترتيب قائمة الأولويات.");
    }, 800);
  };

  const urgentCount = establishments.filter(
    (e) => e.riskLevel === "critical" || e.riskLevel === "high",
  ).length;

  return (
    <>
      <Toast message={toastMessage} />

      {/* Navigation Rail */}
      <SidebarNav urgentCount={urgentCount} />

      {/* Main Content Container */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-10 max-w-7xl mx-auto w-full z-10">
        {/* SECTION 1: EXECUTIVE EDITORIAL HEADER */}
        <DashboardHeader
          onRecalculate={handleRecalculate}
          onOpenDispatch={() => handleOpenDispatch()}
        />

        {/* SECTION: MADINAH TACTICAL GIS MAP */}
        <MadinahMap establishments={establishments} />

        {/* SECTION 2 & 2.5: KPI METRICS STRIP + TELEMETRY */}
        <KpiSummary establishments={establishments} violations={violations} />

        {/* SECTION 3: INTELLIGENCE BRIEF (PRIORITY DOSSIER STAR + QUEUE) */}
        <RiskPrioritySection
          establishments={sortedEstablishments}
          violations={violations}
          onOpenDispatchModal={(name, score, level) =>
            handleOpenDispatch(name, score, level)
          }
          onOpenBatchModal={handleOpenBatch}
        />

        {/* SECTION 4: INSTITUTIONAL GOVERNMENT DATA TABLE */}
        <EstablishmentsTable
          establishments={sortedEstablishments}
          violations={violations}
          onOpenDispatchModal={(name, score, level) =>
            handleOpenDispatch(name, score, level)
          }
        />

        {/* SECTION 5: RISK ENGINE METHODOLOGY & AUDIT TRAIL */}
        <RiskDistribution establishments={establishments} />

        {/* SECTION 6: INSTITUTIONAL FOOTER */}
        <footer className="pt-6 pb-10 border-t border-gov-border text-xs text-gov-muted flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-center md:text-right">
            <p className="font-semibold text-gov-charcoal">
              المفتش الذكي — المنظومة الرقابية الذكية لمنطقة المدينة المنورة
            </p>
            <p className="text-[11px]">
              نموذج تشغيلي استرشادي لتوجيه الجولات التفتيشية البلدية
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-gov-subtle">
            <span>ISO/IEC 27001</span>
            <span>·</span>
            <span>بوابة الرقابة الموحدة</span>
          </div>
        </footer>
      </main>

      {/* Tour Assignment / Dispatch Modal */}
      <DispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        targetName={modalTarget}
        priorityLevel={modalPriority}
        isBatch={isBatchModal}
      />
    </>
  );
}
