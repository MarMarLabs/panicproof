import { notFound } from "next/navigation";
import { getCase } from "@/lib/case-service";
import { CaseWorkbench } from "@/components/case-workbench";

export const dynamic = "force-dynamic";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: CasePageProps) {
  const { id } = await params;
  const caseRecord = await getCase(id);
  return {
    title: caseRecord?.title ?? "Case",
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const caseRecord = await getCase(id);

  if (!caseRecord) notFound();

  return <CaseWorkbench initialCase={caseRecord} />;
}
