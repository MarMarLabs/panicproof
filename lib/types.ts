export const CASE_TYPES = [
  "flight_cancellation",
  "security_deposit",
  "chargeback_refund",
] as const;

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  flight_cancellation: "Flight cancellation",
  security_deposit: "Security deposit",
  chargeback_refund: "Chargeback / refund",
};

export const ARTIFACT_KINDS = [
  "pdf",
  "image",
  "screenshot",
  "email",
  "text",
] as const;

export const FACT_CATEGORIES = [
  "parties",
  "dates",
  "amounts",
  "promises",
  "deadlines",
  "evidence",
] as const;

export const PRIORITIES = ["high", "medium", "low"] as const;
export const ACTION_STATUSES = ["todo", "done"] as const;
export const DRAFT_CHANNELS = ["email", "support_chat", "call_script"] as const;

export type CaseType = (typeof CASE_TYPES)[number];
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];
export type FactCategory = (typeof FACT_CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type DraftChannel = (typeof DRAFT_CHANNELS)[number];

export type ArtifactDTO = {
  id: string;
  caseId: string;
  kind: ArtifactKind | string;
  fileName: string;
  mimeType: string;
  localPath: string;
  extractedText: string;
  createdAt: string;
};

export type FactDTO = {
  id: string;
  caseId: string;
  category: FactCategory | string;
  key: string;
  value: string;
  confidence: number;
  sourceArtifactId: string | null;
  editable: boolean;
  createdAt: string;
};

export type TimelineEventDTO = {
  id: string;
  caseId: string;
  label: string;
  eventDate: string;
  sourceArtifactId: string | null;
  createdAt: string;
};

export type ActionItemDTO = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  priority: Priority | string;
  dueDate: string | null;
  status: ActionStatus | string;
  rationale: string;
  createdAt: string;
};

export type DraftDTO = {
  id: string;
  caseId: string;
  channel: DraftChannel | string;
  title: string;
  body: string;
  createdAt: string;
};

export type CaseDTO = {
  id: string;
  title: string;
  caseType: CaseType | string;
  status: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  artifacts: ArtifactDTO[];
  facts: FactDTO[];
  timeline: TimelineEventDTO[];
  actions: ActionItemDTO[];
  drafts: DraftDTO[];
};

export type SampleDefinition = {
  id: string;
  title: string;
  caseType: CaseType;
  status: string;
  summary: string;
  blurb: string;
  route: string;
  artifacts: Array<
    Omit<ArtifactDTO, "caseId" | "createdAt" | "kind"> & {
      kind: ArtifactKind;
      extractedText: string;
    }
  >;
  facts: Array<
    Omit<FactDTO, "caseId" | "createdAt" | "category"> & {
      category: FactCategory;
    }
  >;
  timeline: Array<Omit<TimelineEventDTO, "caseId" | "createdAt">>;
  actions: Array<
    Omit<ActionItemDTO, "caseId" | "createdAt" | "priority" | "status"> & {
      priority: Priority;
      status: ActionStatus;
    }
  >;
  drafts: Array<
    Omit<DraftDTO, "caseId" | "createdAt" | "channel"> & {
      channel: DraftChannel;
    }
  >;
};
