import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCase } from "@/lib/case-service";
import { generateActionsFromFacts } from "@/lib/actions/generator";
import { generateActionsWithOpenRouter } from "@/lib/analysis/openrouter";
import { updateActionSchema } from "@/lib/validators";

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

  const openRouterPlan = await generateActionsWithOpenRouter(caseRecord).catch(
    (error) => {
      console.warn("OpenRouter actions failed; using demo action generator.", error);
      return null;
    }
  );
  const generated =
    openRouterPlan?.actions ??
    generateActionsFromFacts(caseRecord.caseType, caseRecord.facts);
  await prisma.$transaction([
    prisma.actionItem.deleteMany({ where: { caseId: id } }),
    ...generated.map((action) =>
      prisma.actionItem.create({
        data: {
          caseId: id,
          title: action.title,
          description: action.description,
          priority: action.priority,
          dueDate: action.dueDate ? new Date(action.dueDate) : null,
          status: action.status,
          rationale: action.rationale,
        },
      })
    ),
  ]);

  const updated = await getCase(id);
  return NextResponse.json({ case: updated });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = updateActionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid action update.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id: actionId, dueDate, ...data } = parsed.data;
  await prisma.actionItem.update({
    where: { id: actionId, caseId: id },
    data: {
      ...data,
      dueDate:
        dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
    },
  });

  const updated = await getCase(id);
  return NextResponse.json({ case: updated });
}
