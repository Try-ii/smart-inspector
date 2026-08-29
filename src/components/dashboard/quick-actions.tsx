import React from "react";
import { ArrowLeftIcon, BuildingIcon, ClipboardIcon, RepeatIcon } from "./icons";

const actions = [
  { label: "بدء جولة تفتيش", detail: "انتقل إلى أعلى أولوية", href: "#priority", icon: <ClipboardIcon size={18} />, primary: true },
  { label: "عرض المنشآت", detail: "قائمة المتابعة والمخاطر", href: "#establishments", icon: <BuildingIcon size={18} />, primary: false },
  { label: "سجل المخالفات", detail: "الأنماط المتكررة", href: "#establishments", icon: <RepeatIcon size={18} />, primary: false },
];

export function QuickActions() {
  return (
    <section className="si-quick-section" aria-label="إجراءات سريعة">
      <div className="si-panel-heading"><div><span className="si-eyebrow">تنفيذ ميداني</span><h3>إجراءات سريعة</h3></div></div>
      <div className="si-quick-grid">
        {actions.map((action) => <a className={`si-quick-action ${action.primary ? "si-quick-primary" : ""}`} href={action.href} key={action.label}>
          <span className="si-quick-icon" aria-hidden="true">{action.icon}</span>
          <span><strong>{action.label}</strong><small>{action.detail}</small></span>
          <ArrowLeftIcon size={15} />
        </a>)}
      </div>
    </section>
  );
}
