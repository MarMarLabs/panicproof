import { z } from "zod";

export const caseTypeSchema = z.enum([
  "flight_cancellation",
  "security_deposit",
  "chargeback_refund",
]);

export const artifactKindSchema = z.enum([
  "pdf",
  "image",
  "screenshot",
  "email",
  "text",
]);

export const factSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.string().min(1),
  confidence: z.coerce.number().min(0).max(1),
  sourceArtifactId: z.string().nullable().optional(),
  editable: z.boolean().default(true),
});

export const updateFactsSchema = z.object({
  facts: z.array(factSchema).min(1),
});

export const updateActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["todo", "done"]).optional(),
  rationale: z.string().min(1).optional(),
});

export const createCaseSchema = z.object({
  title: z.string().min(1).max(120),
  caseType: caseTypeSchema,
});
