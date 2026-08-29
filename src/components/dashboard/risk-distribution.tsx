import React from "react";
import type { Establishment } from "@/types/entities";
import { SlidersIcon } from "./icons";

interface RiskDistributionProps {
  establishments?: Establishment[];
}

export function RiskDistribution({ establishments }: RiskDistributionProps) {
  return (
    <section className="mb-10 seq-engine" id="engine">
      <div className="bg-gov-sandlight/40 border border-gov-border rounded-md p-5 md:p-6 gov-card-shadow">
        <div className="flex items-center gap-2 text-xs font-bold text-gov-emerald mb-1">
          <SlidersIcon size={14} />
          <span>حوكمة الخوارزمية الرقابية</span>
        </div>

        <h3 className="text-base md:text-lg font-bold text-gov-charcoal">
          معايير احتساب مؤشر المخاطر الذكي
        </h3>

        <p className="text-xs text-gov-muted mt-1 max-w-3xl leading-relaxed">
          يعتمد المحرك على 4 معاملات ترجيحية رئيسية لاحتساب الأولوية التفتيشية
          التلقائية لضمان النزاهة والعدالة الرقابية وتوجيه المفتشين للأثر الأعلى.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="bg-white p-3.5 rounded border border-gov-border gov-card-hover">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gov-charcoal">
                نوع النشاط وحساسيته
              </span>
              <span className="font-mono text-gov-emerald font-bold font-num">
                35%
              </span>
            </div>
            <p className="text-gov-muted text-[11px] leading-relaxed">
              المنشآت الغذائية ومحطات المياه تحظى بوزن نسبي أعلى للأثر الصحي.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded border border-gov-border gov-card-hover">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gov-charcoal">
                تكرار المخالفات السابقة
              </span>
              <span className="font-mono text-gov-emerald font-bold font-num">
                30%
              </span>
            </div>
            <p className="text-gov-muted text-[11px] leading-relaxed">
              مضاعفة المعامل في حال تكرار نفس البند المخالف خلال نافذة 90 يوماً.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded border border-gov-border gov-card-hover">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gov-charcoal">
                الزمن منذ آخر جولة
              </span>
              <span className="font-mono text-gov-emerald font-bold font-num">
                20%
              </span>
            </div>
            <p className="text-gov-muted text-[11px] leading-relaxed">
              دالة تصاعدية ترفع احتمالية التفتيش كلما طالت فترة غياب الرقابة
              الميدانية.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded border border-gov-border gov-card-hover">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gov-charcoal">
                بلاغات منصة بلدي
              </span>
              <span className="font-mono text-gov-emerald font-bold font-num">
                15%
              </span>
            </div>
            <p className="text-gov-muted text-[11px] leading-relaxed">
              تكامل فوري مع البلاغات المعتمدة والشكاوى الواردة من المستفيدين.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
