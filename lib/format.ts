import { CASE_TYPE_LABELS, type CaseType } from "@/lib/types";

export function formatCaseType(caseType: string) {
  return CASE_TYPE_LABELS[caseType as CaseType] ?? titleize(caseType);
}

export function titleize(input: string) {
  return input
    .replaceAll("_", " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function formatDate(input: string | Date | null | undefined) {
  if (!input) return "No due date";
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function truncate(input: string, max = 140) {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trim()}...`;
}

export function confidenceLabel(confidence: number) {
  if (confidence >= 0.86) return "High confidence";
  if (confidence >= 0.68) return "Medium confidence";
  return "Needs review";
}

export function caseConfidence(facts: Array<{ confidence: number }>) {
  if (!facts.length) return 0;
  return Math.round(
    (facts.reduce((total, fact) => total + fact.confidence, 0) / facts.length) *
      100
  );
}
