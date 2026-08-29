export type EstablishmentType =
  | "restaurant"
  | "grocery"
  | "pharmacy"
  | "warehouse"
  | "salon";

export type EstablishmentStatus = "active" | "inactive";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ViolationCategory =
  | "food_storage"
  | "hygiene"
  | "expired_product"
  | "fire_safety"
  | "pest_control";

export type ViolationSeverity = "low" | "medium" | "high" | "critical";

export type InspectionStatus = "draft" | "in_progress" | "completed";

export interface Establishment {
  id: string;
  name: string;
  licenseNumber: string;
  type: EstablishmentType;
  district: string;
  address: string;
  ownerName: string;
  lastInspectionDate: string;
  baselineRisk: number;
  currentRiskScore: number;
  riskLevel: RiskLevel;
  status: EstablishmentStatus;
}

export interface Violation {
  id: string;
  establishmentId: string;
  inspectionId: string;
  date: string;
  category: ViolationCategory;
  severity: ViolationSeverity;
  description: string;
  evidenceUrl: string | null;
  isRepeat: boolean;
  matchedPreviousViolationId: string | null;
}

export interface Inspection {
  id: string;
  establishmentId: string;
  inspectorName: string;
  startedAt: string;
  completedAt: string | null;
  status: InspectionStatus;
  violations: Violation[];
  summary: string | null;
  riskScoreBefore: number;
  riskScoreAfter: number | null;
}

export interface AiViolationSuggestion {
  category: ViolationCategory;
  severity: ViolationSeverity;
  description: string;
  confidence: number | null;
  source: "live_ai" | "deterministic_fallback";
}

export interface RiskScoreBreakdown {
  baselineRisk: number;
  violationPoints: number;
  repeatViolationPoints: number;
  staleInspectionPoints: number;
  finalScore: number;
  riskLevel: RiskLevel;
}
