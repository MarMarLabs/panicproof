import { describe, expect, it } from "vitest";
import { mockAnalyzeCase } from "@/lib/analysis/mock";
import { sampleCases } from "@/lib/sample-data";

describe("mockAnalyzeCase", () => {
  it("returns deterministic seeded analysis for built-in samples", () => {
    const sample = sampleCases[0];
    const result = mockAnalyzeCase({
      caseId: sample.id,
      title: sample.title,
      caseType: sample.caseType,
      artifacts: sample.artifacts.map((artifact) => ({
        ...artifact,
        caseId: sample.id,
        createdAt: new Date().toISOString(),
      })),
    });

    expect(result.title).toBe(sample.title);
    expect(result.facts).toHaveLength(sample.facts.length);
    expect(result.actions.length).toBeGreaterThanOrEqual(3);
    expect(result.drafts).toHaveLength(2);
  });

  it("creates a starter analysis for uploaded non-sample evidence", () => {
    const result = mockAnalyzeCase({
      caseId: "custom",
      title: "Custom refund issue",
      caseType: "chargeback_refund",
      artifacts: [
        {
          id: "artifact-custom",
          caseId: "custom",
          kind: "text",
          fileName: "notes.txt",
          mimeType: "text/plain",
          localPath: "",
          extractedText: "Order total $42.50. Return delivered May 1, 2026.",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    expect(result.summary).toContain("starter evidence bundle");
    expect(result.facts.some((fact) => fact.value === "$42.50")).toBe(true);
    expect(result.actions[0].priority).toBe("high");
  });
});
