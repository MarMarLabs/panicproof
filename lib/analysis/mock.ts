import { randomUUID } from "node:crypto";
import { findSampleCase } from "@/lib/sample-data";
import type { ArtifactDTO, FactDTO } from "@/lib/types";
import { generateActionsFromFacts } from "@/lib/actions/generator";
import type { CaseAnalysis } from "@/lib/analysis/schemas";

type AnalyzerInput = {
  caseId: string;
  title: string;
  caseType: string;
  artifacts: ArtifactDTO[];
};

function makeId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

function inferFactsFromText(input: AnalyzerInput): FactDTO[] {
  const joined = input.artifacts.map((artifact) => artifact.extractedText).join("\n");
  const amountMatch = joined.match(/\$[0-9,]+(?:\.[0-9]{2})?/);
  const dateMatch = joined.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/i
  );
  const party = input.caseType === "security_deposit"
    ? "Property manager / tenant"
    : input.caseType === "chargeback_refund"
      ? "Merchant / customer"
      : "Carrier / traveler";

  return [
    {
      id: makeId("fact-party"),
      caseId: input.caseId,
      category: "parties",
      key: "Likely parties",
      value: party,
      confidence: 0.58,
      sourceArtifactId: input.artifacts[0]?.id ?? null,
      editable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId("fact-amount"),
      caseId: input.caseId,
      category: "amounts",
      key: "Amount mentioned",
      value: amountMatch?.[0] ?? "Add amount manually",
      confidence: amountMatch ? 0.72 : 0.35,
      sourceArtifactId: input.artifacts[0]?.id ?? null,
      editable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId("fact-date"),
      caseId: input.caseId,
      category: "dates",
      key: "Important date",
      value: dateMatch?.[0] ?? "Add date manually",
      confidence: dateMatch ? 0.7 : 0.32,
      sourceArtifactId: input.artifacts[0]?.id ?? null,
      editable: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: makeId("fact-evidence"),
      caseId: input.caseId,
      category: "evidence",
      key: "Evidence bundle",
      value: `${input.artifacts.length} uploaded artifact${
        input.artifacts.length === 1 ? "" : "s"
      } with extracted text ready for review.`,
      confidence: 0.82,
      sourceArtifactId: null,
      editable: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function mockAnalyzeCase(input: AnalyzerInput): CaseAnalysis {
  const sample = findSampleCase(input.caseId);
  if (sample) {
    return {
      caseType: sample.caseType,
      title: sample.title,
      summary: sample.summary,
      facts: sample.facts.map(({ id, ...fact }) => {
        void id;
        return fact;
      }),
      timeline: sample.timeline.map(({ id, ...event }) => {
        void id;
        return event;
      }),
      actions: sample.actions.map(({ id, ...action }) => {
        void id;
        return action;
      }),
      drafts: sample.drafts.map(({ id, ...draft }) => {
        void id;
        return draft;
      }),
    };
  }

  const facts = inferFactsFromText(input);
  const actions = generateActionsFromFacts(input.caseType, facts);

  return {
    caseType: input.caseType as CaseAnalysis["caseType"],
    title: input.title,
    summary:
      "PanicProof found a starter evidence bundle. Review the extracted facts, fill in any missing dates or amounts, then generate the final action board.",
    facts: facts.map(({ id, caseId, createdAt, ...fact }) => {
      void id;
      void caseId;
      void createdAt;
      return fact;
    }),
    timeline: input.artifacts.slice(0, 3).map((artifact, index) => ({
      label: `Evidence added: ${artifact.fileName}`,
      eventDate: new Date(Date.now() + index * 1000).toISOString(),
      sourceArtifactId: artifact.id,
    })),
    actions,
    drafts: [
      {
        channel: "email",
        title: "Starter email",
        body:
          "Hello,\n\nI am organizing the attached evidence and would like help resolving this issue. Please review the attached documents and confirm the next step, expected timing, and any reference number I should use.\n\nThank you.",
      },
      {
        channel: "support_chat",
        title: "Starter support message",
        body:
          "Hi, I have evidence ready for this issue and need help confirming the next step. Can you review the attached details and share the correct claim or support reference?",
      },
    ],
  };
}
