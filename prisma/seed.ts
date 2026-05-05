import { PrismaClient } from "@prisma/client";
import { sampleCases } from "../lib/sample-data";

const prisma = new PrismaClient();

async function seed() {
  for (const sample of sampleCases) {
    await prisma.case.upsert({
      where: { id: sample.id },
      update: {
        title: sample.title,
        caseType: sample.caseType,
        status: sample.status,
        summary: sample.summary,
        artifacts: { deleteMany: {} },
        facts: { deleteMany: {} },
        timeline: { deleteMany: {} },
        actions: { deleteMany: {} },
        drafts: { deleteMany: {} },
      },
      create: {
        id: sample.id,
        title: sample.title,
        caseType: sample.caseType,
        status: sample.status,
        summary: sample.summary,
      },
    });

    await prisma.artifact.createMany({
      data: sample.artifacts.map((artifact) => ({
        id: artifact.id,
        caseId: sample.id,
        kind: artifact.kind,
        fileName: artifact.fileName,
        mimeType: artifact.mimeType,
        localPath: artifact.localPath,
        extractedText: artifact.extractedText,
      })),
    });

    await prisma.fact.createMany({
      data: sample.facts.map((fact) => ({
        id: fact.id,
        caseId: sample.id,
        category: fact.category,
        key: fact.key,
        value: fact.value,
        confidence: fact.confidence,
        sourceArtifactId: fact.sourceArtifactId,
        editable: fact.editable,
      })),
    });

    await prisma.timelineEvent.createMany({
      data: sample.timeline.map((event) => ({
        id: event.id,
        caseId: sample.id,
        label: event.label,
        eventDate: new Date(event.eventDate),
        sourceArtifactId: event.sourceArtifactId,
      })),
    });

    await prisma.actionItem.createMany({
      data: sample.actions.map((action) => ({
        id: action.id,
        caseId: sample.id,
        title: action.title,
        description: action.description,
        priority: action.priority,
        dueDate: action.dueDate ? new Date(action.dueDate) : null,
        status: action.status,
        rationale: action.rationale,
      })),
    });

    await prisma.draft.createMany({
      data: sample.drafts.map((draft) => ({
        id: draft.id,
        caseId: sample.id,
        channel: draft.channel,
        title: draft.title,
        body: draft.body,
      })),
    });
  }
}

seed()
  .then(async () => {
    console.log(`Seeded ${sampleCases.length} PanicProof sample cases.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
