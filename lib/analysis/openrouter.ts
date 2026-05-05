import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { caseAnalysisSchema, type CaseAnalysis } from "@/lib/analysis/schemas";
import { reviewDisclaimer } from "@/lib/sample-data";
import type { ArtifactDTO } from "@/lib/types";

type OpenRouterAnalyzerInput = {
  title: string;
  caseType: string;
  artifacts: ArtifactDTO[];
};

const openRouterBaseURL = "https://openrouter.ai/api/v1";

export async function analyzeWithOpenRouter(
  input: OpenRouterAnalyzerInput
): Promise<CaseAnalysis | null> {
  if (!process.env.OPENROUTER_API_KEY) return null;

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL ?? openRouterBaseURL,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-OpenRouter-Title": "PanicProof",
    },
  });

  const artifactText = input.artifacts
    .map(
      (artifact) =>
        `Artifact ${artifact.id} (${artifact.fileName}, ${artifact.kind}):\n${artifact.extractedText}`
    )
    .join("\n\n---\n\n");

  const completion = await client.chat.completions.parse({
    model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You extract consumer-problem evidence into a non-legal organization and drafting workspace. Do not give legal advice. Every action must be editable, practical, evidence-grounded, and written for human review before sending.",
      },
      {
        role: "user",
        content: `Product disclaimer: ${reviewDisclaimer}\n\nKnown case type: ${input.caseType}\nCase title: ${input.title}\n\nReturn a concise summary, normalized facts, dated timeline, 3 to 7 prioritized action items, and exactly 2 draft messages. Use artifact ids as sourceArtifactId when supported by evidence.\n\n${artifactText}`,
      },
    ],
    temperature: 0.2,
    response_format: zodResponseFormat(caseAnalysisSchema, "panicproof_case_analysis"),
  });

  return completion.choices[0]?.message.parsed ?? null;
}
