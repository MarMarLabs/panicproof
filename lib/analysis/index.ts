import { analyzeWithOpenRouter } from "@/lib/analysis/openrouter";
import { mockAnalyzeCase } from "@/lib/analysis/mock";
import { caseAnalysisSchema } from "@/lib/analysis/schemas";
import type { ArtifactDTO } from "@/lib/types";

type AnalyzeCaseInput = {
  id: string;
  title: string;
  caseType: string;
  artifacts: ArtifactDTO[];
};

export async function analyzeCase(input: AnalyzeCaseInput) {
  const openRouterResult = await analyzeWithOpenRouter(input).catch((error) => {
    console.warn("OpenRouter analysis failed; falling back to demo analyzer.", error);
    return null;
  });

  const result =
    openRouterResult ??
    mockAnalyzeCase({
      caseId: input.id,
      title: input.title,
      caseType: input.caseType,
      artifacts: input.artifacts,
    });
  return caseAnalysisSchema.parse(result);
}
