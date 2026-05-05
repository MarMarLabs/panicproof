import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCase } from "@/lib/case-service";
import { generateDraftsWithOpenRouter } from "@/lib/analysis/openrouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function buildDrafts(caseRecord: NonNullable<Awaited<ReturnType<typeof getCase>>>) {
  const leadFact = caseRecord.facts[0];
  const amount = caseRecord.facts.find((fact) => fact.category === "amounts");
  const deadline = caseRecord.facts.find((fact) => fact.category === "deadlines");
  const action = caseRecord.actions[0];

  return [
    {
      channel: "email",
      title: "Reviewed evidence email",
      body: `Hello,\n\nI am following up with an organized evidence summary for "${caseRecord.title}." ${
        amount ? `The amount currently in question is ${amount.value}. ` : ""
      }${deadline ? `The relevant deadline I have recorded is ${deadline.value}. ` : ""}\n\nMy requested next step is: ${
        action?.title ?? "please review the attached information and confirm the next step"
      }.\n\nPlease confirm receipt and share any reference number for this issue.\n\nThank you.`,
    },
    {
      channel: "support_chat",
      title: "Reviewed support message",
      body: `Hi, I have reviewed my facts and evidence for "${caseRecord.title}." ${
        leadFact ? `Key detail: ${leadFact.key}: ${leadFact.value}. ` : ""
      }Can you confirm the next step, expected timing, and a reference number?`,
    },
  ] as const;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const caseRecord = await getCase(id);

  if (!caseRecord) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const openRouterDrafts = await generateDraftsWithOpenRouter(caseRecord).catch(
    (error) => {
      console.warn("OpenRouter drafts failed; using demo draft generator.", error);
      return null;
    }
  );
  const drafts = openRouterDrafts?.drafts ?? buildDrafts(caseRecord);
  await prisma.$transaction([
    prisma.draft.deleteMany({ where: { caseId: id } }),
    ...drafts.map((draft) =>
      prisma.draft.create({
        data: {
          caseId: id,
          channel: draft.channel,
          title: draft.title,
          body: draft.body,
        },
      })
    ),
  ]);

  const updated = await getCase(id);
  return NextResponse.json({ case: updated });
}
