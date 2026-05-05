import { NextResponse } from "next/server";
import { analyzeCase } from "@/lib/analysis";
import { applyAnalysis, getCase, replaceFacts } from "@/lib/case-service";
import { updateFactsSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const caseRecord = await getCase(id);

  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const analysis = await analyzeCase(caseRecord);
  const updated = await applyAnalysis(id, analysis);

  return NextResponse.json({ case: updated });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = updateFactsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid fact edits.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await replaceFacts(id, parsed.data.facts);
  if (!updated) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  return NextResponse.json({ case: updated });
}
