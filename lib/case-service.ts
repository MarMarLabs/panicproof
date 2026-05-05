import { prisma } from "@/lib/db";
import type { CaseDTO } from "@/lib/types";
import type { CaseAnalysis } from "@/lib/analysis/schemas";

const includeAll = {
  artifacts: { orderBy: { createdAt: "asc" as const } },
  facts: { orderBy: { createdAt: "asc" as const } },
  timeline: { orderBy: { eventDate: "asc" as const } },
  actions: { orderBy: [{ priority: "asc" as const }, { createdAt: "asc" as const }] },
  drafts: { orderBy: { createdAt: "asc" as const } },
};

type CaseWithRelations = Awaited<ReturnType<typeof getCaseRecord>>;

async function getCaseRecord(id: string) {
  return prisma.case.findUnique({
    where: { id },
    include: includeAll,
  });
}

function dateToString(date: Date | null) {
  return date ? date.toISOString() : null;
}

export function serializeCase(record: NonNullable<CaseWithRelations>): CaseDTO {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    artifacts: record.artifacts.map((artifact) => ({
      ...artifact,
      createdAt: artifact.createdAt.toISOString(),
    })),
    facts: record.facts.map((fact) => ({
      ...fact,
      sourceArtifactId: fact.sourceArtifactId ?? null,
      createdAt: fact.createdAt.toISOString(),
    })),
    timeline: record.timeline.map((event) => ({
      ...event,
      eventDate: event.eventDate.toISOString(),
      sourceArtifactId: event.sourceArtifactId ?? null,
      createdAt: event.createdAt.toISOString(),
    })),
    actions: record.actions.map((action) => ({
      ...action,
      dueDate: dateToString(action.dueDate),
      createdAt: action.createdAt.toISOString(),
    })),
    drafts: record.drafts.map((draft) => ({
      ...draft,
      createdAt: draft.createdAt.toISOString(),
    })),
  };
}

export async function getCase(id: string) {
  const record = await getCaseRecord(id);
  return record ? serializeCase(record) : null;
}

export async function listCases() {
  const records = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      artifacts: true,
      facts: true,
      actions: true,
      drafts: true,
      timeline: true,
    },
  });

  return records.map(serializeCase);
}

export async function applyAnalysis(caseId: string, analysis: CaseAnalysis) {
  await prisma.$transaction([
    prisma.fact.deleteMany({ where: { caseId } }),
    prisma.timelineEvent.deleteMany({ where: { caseId } }),
    prisma.actionItem.deleteMany({ where: { caseId } }),
    prisma.draft.deleteMany({ where: { caseId } }),
    prisma.case.update({
      where: { id: caseId },
      data: {
        title: analysis.title,
        caseType: analysis.caseType,
        summary: analysis.summary,
        status: "ready",
      },
    }),
  ]);

  await prisma.$transaction([
    ...analysis.facts.map((fact) =>
      prisma.fact.create({
        data: {
          caseId,
          category: fact.category,
          key: fact.key,
          value: fact.value,
          confidence: fact.confidence,
          sourceArtifactId: fact.sourceArtifactId,
          editable: fact.editable,
        },
      })
    ),
    ...analysis.timeline.map((event) =>
      prisma.timelineEvent.create({
        data: {
          caseId,
          label: event.label,
          eventDate: new Date(event.eventDate),
          sourceArtifactId: event.sourceArtifactId,
        },
      })
    ),
    ...analysis.actions.map((action) =>
      prisma.actionItem.create({
        data: {
          caseId,
          title: action.title,
          description: action.description,
          priority: action.priority,
          dueDate: action.dueDate ? new Date(action.dueDate) : null,
          status: action.status,
          rationale: action.rationale,
        },
      })
    ),
    ...analysis.drafts.map((draft) =>
      prisma.draft.create({
        data: {
          caseId,
          channel: draft.channel,
          title: draft.title,
          body: draft.body,
        },
      })
    ),
  ]);

  return getCase(caseId);
}

export async function replaceFacts(
  caseId: string,
  facts: Array<{
    id?: string;
    category: string;
    key: string;
    value: string;
    confidence: number;
    sourceArtifactId?: string | null;
    editable: boolean;
  }>
) {
  await prisma.$transaction([
    prisma.fact.deleteMany({ where: { caseId } }),
    ...facts.map((fact) =>
      prisma.fact.create({
        data: {
          caseId,
          category: fact.category,
          key: fact.key,
          value: fact.value,
          confidence: fact.confidence,
          sourceArtifactId: fact.sourceArtifactId ?? null,
          editable: fact.editable,
        },
      })
    ),
  ]);

  return getCase(caseId);
}
