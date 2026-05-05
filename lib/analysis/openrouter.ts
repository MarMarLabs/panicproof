import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  actionPlanSchema,
  caseAnalysisSchema,
  draftListSchema,
  type ActionPlan,
  type CaseAnalysis,
  type DraftList,
} from "@/lib/analysis/schemas";
import { reviewDisclaimer } from "@/lib/sample-data";
import type { ArtifactDTO, CaseDTO } from "@/lib/types";

type OpenRouterAnalyzerInput = {
  title: string;
  caseType: string;
  artifacts: ArtifactDTO[];
};

const openRouterBaseURL = "https://openrouter.ai/api/v1";

function createOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) return null;

  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL ?? openRouterBaseURL,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-OpenRouter-Title": "PanicProof",
    },
  });
}

function artifactContext(artifacts: ArtifactDTO[]) {
  return artifacts
    .map((artifact) => {
      return `Artifact ${artifact.id} (${artifact.fileName}, ${artifact.kind}):\n${artifact.extractedText}`;
    })
    .join("\n\n---\n\n");
}

function factContext(caseRecord: CaseDTO) {
  return caseRecord.facts
    .map((fact) => {
      const source = fact.sourceArtifactId ? ` source=${fact.sourceArtifactId}` : "";
      return `- ${fact.category} / ${fact.key}: ${fact.value} (confidence ${fact.confidence}${source})`;
    })
    .join("\n");
}

function actionContext(caseRecord: CaseDTO) {
  return caseRecord.actions
    .map((action) => {
      return `- ${action.priority.toUpperCase()}: ${action.title} (${action.status}) ${action.dueDate ?? "no due date"}\n  ${action.description}`;
    })
    .join("\n");
}

export async function analyzeWithOpenRouter(
  input: OpenRouterAnalyzerInput
): Promise<CaseAnalysis | null> {
  const client = createOpenRouterClient();
  if (!client) return null;

  const completion = await client.chat.completions.parse({
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.5",
    messages: [
      {
        role: "system",
        content:
          "You extract consumer-problem evidence into a non-legal organization and drafting workspace. Do not give legal advice. Every action must be editable, practical, evidence-grounded, and written for human review before sending.",
      },
      {
        role: "user",
        content: `Product disclaimer: ${reviewDisclaimer}\n\nKnown case type: ${input.caseType}\nCase title: ${input.title}\n\nReturn a concise summary, normalized facts, dated timeline, 3 to 7 prioritized action items, and exactly 2 draft messages. Use artifact ids as sourceArtifactId when supported by evidence.\n\n${artifactContext(input.artifacts)}`,
      },
    ],
    temperature: 0.2,
    response_format: zodResponseFormat(
      caseAnalysisSchema,
      "panicproof_case_analysis"
    ),
  });

  return completion.choices[0]?.message.parsed ?? null;
}

export async function generateActionsWithOpenRouter(
  caseRecord: CaseDTO
): Promise<ActionPlan | null> {
  const client = createOpenRouterClient();
  if (!client) return null;

  const completion = await client.chat.completions.parse({
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.5",
    messages: [
      {
        role: "system",
        content:
          "You create non-legal, evidence-grounded consumer issue action plans. Every action must be editable, practical, deadline-aware, and reviewed by a human before use.",
      },
      {
        role: "user",
        content: `Product disclaimer: ${reviewDisclaimer}\n\nCase type: ${caseRecord.caseType}\nTitle: ${caseRecord.title}\nSummary: ${caseRecord.summary}\n\nReviewed facts:\n${factContext(caseRecord)}\n\nEvidence context:\n${artifactContext(caseRecord.artifacts)}\n\nReturn 3 to 7 prioritized next actions. Include ISO date strings or null for dueDate. Do not give legal advice.`,
      },
    ],
    temperature: 0.25,
    response_format: zodResponseFormat(
      actionPlanSchema,
      "panicproof_action_plan"
    ),
  });

  return completion.choices[0]?.message.parsed ?? null;
}

export async function generateDraftsWithOpenRouter(
  caseRecord: CaseDTO
): Promise<DraftList | null> {
  const client = createOpenRouterClient();
  if (!client) return null;

  const completion = await client.chat.completions.parse({
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.5",
    messages: [
      {
        role: "system",
        content:
          "You draft plain-language consumer issue messages. This is organization and drafting support, not legal advice. Drafts must be ready to edit and review before sending.",
      },
      {
        role: "user",
        content: `Product disclaimer: ${reviewDisclaimer}\n\nCase type: ${caseRecord.caseType}\nTitle: ${caseRecord.title}\nSummary: ${caseRecord.summary}\n\nReviewed facts:\n${factContext(caseRecord)}\n\nCurrent actions:\n${actionContext(caseRecord)}\n\nReturn exactly two drafts: one email and one support_chat message. Keep them concise, specific, and evidence-grounded.`,
      },
    ],
    temperature: 0.3,
    response_format: zodResponseFormat(draftListSchema, "panicproof_drafts"),
  });

  return completion.choices[0]?.message.parsed ?? null;
}
