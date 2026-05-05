import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractUpload } from "@/lib/file-extraction";
import { getCase, listCases } from "@/lib/case-service";
import { analyzeCase } from "@/lib/analysis";
import { applyAnalysis } from "@/lib/case-service";
import { createCaseSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ cases: await listCases() });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = createCaseSchema.safeParse({
    title: formData.get("title"),
    caseType: formData.get("caseType"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a title and case type.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const record = await prisma.case.create({
    data: {
      title: parsed.data.title,
      caseType: parsed.data.caseType,
      status: "extracting",
      summary:
        "Evidence uploaded. Review extracted text and run analysis to build the action board.",
    },
  });

  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!files.length) {
    await prisma.artifact.create({
      data: {
        caseId: record.id,
        kind: "text",
        fileName: "manual-notes.txt",
        mimeType: "text/plain",
        localPath: "",
        extractedText:
          "No file was uploaded. Add manual notes by editing the extracted facts on the case page.",
      },
    });
  } else {
    const artifacts = await Promise.all(
      files.map((file) => extractUpload(record.id, file))
    );
    await prisma.artifact.createMany({
      data: artifacts.map((artifact) => ({
        caseId: record.id,
        ...artifact,
      })),
    });
  }

  const created = await getCase(record.id);
  if (!created) {
    return NextResponse.json({ error: "Case could not be created." }, { status: 500 });
  }

  const analyzed = await analyzeCase(created);
  const updated = await applyAnalysis(record.id, analyzed);

  return NextResponse.json({ case: updated }, { status: 201 });
}
