import type {
  Establishment,
  EstablishmentType,
  RiskLevel,
  Violation,
  ViolationCategory,
} from "@/types/entities";

const establishmentTypeLabels: Record<EstablishmentType, string> = {
  restaurant: "مطعم ومقهى",
  grocery: "متجر تموينات",
  pharmacy: "صيدلية",
  warehouse: "مستودع",
  salon: "صالون عناية",
};

const riskLevelLabels: Record<RiskLevel, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const violationCategoryLabels: Record<ViolationCategory, string> = {
  food_storage: "تخزين الأغذية",
  hygiene: "النظافة العامة",
  expired_product: "منتجات منتهية",
  fire_safety: "السلامة",
  pest_control: "مكافحة الآفات",
};

export function getEstablishmentTypeLabel(type: EstablishmentType) {
  return establishmentTypeLabels[type];
}

export function getRiskLevelLabel(level: RiskLevel) {
  return riskLevelLabels[level];
}

export function getViolationCategoryLabel(category: ViolationCategory) {
  return violationCategoryLabels[category];
}

export function getRiskToneClass(level: RiskLevel) {
  return `risk-${level}`;
}

export function getViolationsForEstablishment(
  violations: Violation[],
  establishmentId: string,
) {
  return violations.filter((violation) => violation.establishmentId === establishmentId);
}

export function getLatestViolation(violations: Violation[]) {
  return [...violations].sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
  )[0];
}

export function getPriorityLabel(score: number) {
  if (score >= 80) return "عاجلة";
  if (score >= 60) return "عالية";
  if (score >= 30) return "متوسطة";
  return "اعتيادية";
}

export function getPriorityReason(
  establishment: Establishment,
  violations: Violation[],
) {
  const hasRepeatViolation = violations.some((violation) => violation.isRepeat);
  const latestViolation = getLatestViolation(violations);

  if (establishment.riskLevel === "critical") {
    return "مستوى خطورة حرج مع مخالفات تستدعي متابعة ميدانية عاجلة.";
  }
  if (hasRepeatViolation) {
    return "تكرار المخالفة يرفع أولوية التحقق الميداني من المعالجة.";
  }
  if (latestViolation) {
    return "سجل مخالفات حديث يجعل الجولة القادمة ذات أولوية تشغيلية.";
  }
  return "تُتابع ضمن المسار الاعتيادي للجولات الدورية.";
}

export function formatDateArabic(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
