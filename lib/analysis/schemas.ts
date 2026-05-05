import { z } from "zod";

export const analysisFactSchema = z.object({
  category: z.string(),
  key: z.string(),
  value: z.string(),
  confidence: z.number(),
  sourceArtifactId: z.string().nullable(),
  editable: z.boolean(),
});

export const timelineEventSchema = z.object({
  label: z.string(),
  eventDate: z.string(),
  sourceArtifactId: z.string().nullable(),
});

export const actionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  dueDate: z.string().nullable(),
  status: z.enum(["todo", "done"]),
  rationale: z.string(),
});

export const draftSchema = z.object({
  channel: z.enum(["email", "support_chat", "call_script"]),
  title: z.string(),
  body: z.string(),
});

export const caseAnalysisSchema = z.object({
  caseType: z.enum([
    "flight_cancellation",
    "security_deposit",
    "chargeback_refund",
  ]),
  title: z.string(),
  summary: z.string(),
  facts: z.array(analysisFactSchema),
  timeline: z.array(timelineEventSchema),
  actions: z.array(actionItemSchema),
  drafts: z.array(draftSchema),
});

export type CaseAnalysis = z.infer<typeof caseAnalysisSchema>;
