import React from "react";
import type { Establishment, Violation } from "@/types/entities";
import { AlertIcon, BellIcon, RepeatIcon } from "./icons";
import { getViolationCategoryLabel } from "./view-model";

interface AlertsPanelProps { establishments: Establishment[]; violations: Violation[]; }

export function AlertsPanel({ establishments, violations }: AlertsPanelProps) {
  const critical = establishments.find((establishment) => establishment.riskLevel === "critical");
  const repeated = violations.find((violation) => violation.isRepeat);
  const repeatedEstablishment = repeated ? establishments.find((establishment) => establishment.id === repeated.establishmentId) : null;
  const alerts = [
    critical && { icon: <AlertIcon size={16} />, tone: "critical", title: "منشأة حرجة بانتظار الجولة", body: `${critical.name} تسجل درجة خطورة ${critical.currentRiskScore}/100.` },
    repeated && repeatedEstablishment && { icon: <RepeatIcon size={16} />, tone: "warning", title: "مخالفة متكررة مرصودة", body: `${getViolationCategoryLabel(repeated.category)} في ${repeatedEstablishment.name}.` },
    { icon: <BellIcon size={16} />, tone: "primary", title: "جدولة الجولة التالية", body: "ابدأ من المنشأة الأعلى أولوية ضمن قائمة اليوم." },
  ].filter(Boolean) as { icon: React.ReactNode; tone: string; title: string; body: string; }[];

  return (
    <section className="si-analysis-panel si-alerts-panel" id="alerts" aria-label="آخر التنبيهات">
      <div className="si-panel-heading"><div><span className="si-eyebrow"><BellIcon size={15} /> المتابعة التشغيلية</span><h3>آخر التنبيهات</h3></div><span>{alerts.length} جديد</span></div>
      <div className="si-alert-list">
        {alerts.map((alert) => <article className={`si-alert si-alert-${alert.tone}`} key={alert.title}>
          <span className="si-alert-icon" aria-hidden="true">{alert.icon}</span>
          <div><strong>{alert.title}</strong><p>{alert.body}</p></div>
        </article>)}
      </div>
    </section>
  );
}
