"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Establishment, Violation } from "@/types/entities";
import { SearchIcon } from "./icons";
import {
  getEstablishmentTypeLabel,
  getViolationsForEstablishment,
} from "./view-model";

interface EstablishmentsTableProps {
  establishments: Establishment[];
  violations: Violation[];
  onOpenDispatchModal?: (name: string, score: number, level: string) => void;
}

export function EstablishmentsTable({
  establishments,
  violations,
  onOpenDispatchModal,
}: EstablishmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const filteredEstablishments = establishments.filter((est) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      est.name.toLowerCase().includes(term) ||
      est.district.toLowerCase().includes(term) ||
      getEstablishmentTypeLabel(est.type).toLowerCase().includes(term);

    const matchesRisk =
      riskFilter === "all" || est.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeStyles = (level: string) => {
    if (level === "critical") {
      return "text-risk-critical bg-risk-criticalBg border border-risk-critical/20";
    }
    if (level === "high") {
      return "text-risk-high bg-risk-highBg border border-risk-high/20";
    }
    if (level === "medium") {
      return "text-risk-medium bg-risk-mediumBg border border-risk-medium/20";
    }
    return "text-risk-low bg-risk-lowBg border border-risk-low/20";
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return "تتطلب جولة فورية";
    if (score >= 70) return "مجدولة هذا الأسبوع";
    if (score >= 50) return "تحت المتابعة الدورية";
    return "ممتثلة";
  };

  return (
    <section className="mb-12 seq-table" id="establishments">
      <div className="bg-white border border-gov-border rounded-md gov-card-shadow overflow-hidden">
        {/* Table Topbar: Filters & Search */}
        <div className="p-4 md:p-5 border-b border-gov-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="text-base md:text-lg font-bold text-gov-charcoal">
              سجل المنشآت الخاضعة للرقابة التفتيشية
            </h3>
            <p className="text-xs text-gov-muted mt-0.5">
              بيانات الرصد الميداني، درجات المخاطر، وحالة الامتثال النظامي
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <SearchIcon
                size={14}
                className="text-gov-muted absolute right-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالاسم أو الحي..."
                className="text-xs bg-gov-canvas border border-gov-border rounded pr-8 pl-3 py-1.5 w-48 md:w-56 focus:outline-none focus:border-gov-emerald"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-gov-canvas border border-gov-border rounded px-2.5 py-1.5 text-gov-charcoal focus:outline-none focus:border-gov-emerald"
            >
              <option value="all">كافة المستويات</option>
              <option value="critical">حرجة (80-100)</option>
              <option value="high">عالية (70-79)</option>
              <option value="medium">متوسطة (50-69)</option>
              <option value="low">منخفضة (0-49)</option>
            </select>
          </div>
        </div>

        {/* Table Responsive Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gov-sandlight/60 text-gov-charcoal font-semibold border-b border-gov-border">
                <th className="py-2.5 px-4">المنشأة والنشاط</th>
                <th className="py-2.5 px-3">الموقع والحي</th>
                <th className="py-2.5 px-3 text-center">مؤشر المخاطر</th>
                <th className="py-2.5 px-3 text-center">المخالفات</th>
                <th className="py-2.5 px-3">تاريخ آخر زيارة</th>
                <th className="py-2.5 px-3 text-center">الحالة الرقابية</th>
                <th className="py-2.5 px-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border">
              {filteredEstablishments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gov-muted">
                    لا توجد منشآت مطابقة لمعايير البحث والتصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredEstablishments.map((est) => {
                  const estViolations = getViolationsForEstablishment(
                    violations,
                    est.id,
                  );
                  const repeatCount = estViolations.filter((v) => v.isRepeat).length;

                  return (
                    <tr
                      key={est.id}
                      className="hover:bg-gov-sandlight/30 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/establishments/${est.id}`}
                          className="font-bold text-gov-charcoal text-sm hover:underline"
                        >
                          {est.name}
                        </Link>
                        <div className="text-gov-muted text-[11px] mt-0.5">
                          {getEstablishmentTypeLabel(est.type)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gov-muted">
                        <span className="text-gov-charcoal font-medium">
                          {est.district}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-num ${getRiskBadgeStyles(
                            est.riskLevel,
                          )}`}
                        >
                          {est.currentRiskScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-gov-charcoal font-num">
                          {estViolations.length}
                        </span>
                        {repeatCount > 0 && (
                          <span className="text-[10px] text-risk-critical font-bold mr-1">
                            ({repeatCount} مكرر)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gov-muted font-mono">
                        {est.lastInspectionDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gov-canvas border border-gov-border text-gov-charcoal">
                          {getStatusText(est.currentRiskScore)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => {
                            if (onOpenDispatchModal) {
                              onOpenDispatchModal(
                                est.name,
                                est.currentRiskScore,
                                est.riskLevel,
                              );
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gov-charcoal bg-white hover:bg-gov-sandlight border border-gov-border rounded transition cursor-pointer"
                          type="button"
                        >
                          إسناد جولة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 border-t border-gov-border bg-gov-canvas flex flex-col sm:flex-row items-center justify-between text-xs text-gov-muted gap-2">
          <span>
            عرض{" "}
            <span className="font-bold text-gov-charcoal font-num">
              {filteredEstablishments.length}
            </span>{" "}
            من إجمالي{" "}
            <span className="font-bold text-gov-charcoal font-num">
              {establishments.length}
            </span>{" "}
            منشأة خاضعة
          </span>
          <span className="text-[11px] text-gov-subtle">
            الامتثال وفق لائحة الجزاءات البلدية 1445هـ
          </span>
        </div>
      </div>
    </section>
  );
}
