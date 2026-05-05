import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleCases } from "@/lib/sample-data";
import { CASE_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sample Scenarios",
};

export default function SamplesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeftIcon data-icon="inline-start" />
            Home
          </Link>
          <Badge variant="outline" className="rounded-md bg-white">
            Seeded demo library
          </Badge>
        </header>

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Built-in PanicProof scenarios
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              These cases are seeded into SQLite and mirrored by sample files in
              <span className="font-mono text-xs"> /public/samples</span>, so
              the app can be presented without connecting paid services.
            </p>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          {sampleCases.map((sample) => (
            <Card key={sample.id} className="border-teal-100 bg-white">
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <FileTextIcon aria-hidden="true" />
                </div>
                <Badge variant="secondary" className="w-fit rounded-md">
                  {CASE_TYPE_LABELS[sample.caseType]}
                </Badge>
                <CardTitle className="pt-2 text-xl">{sample.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="text-sm leading-6 text-slate-600">{sample.blurb}</p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Included artifacts
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
                    {sample.artifacts.map((artifact) => (
                      <li key={artifact.id}>{artifact.fileName}</li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={`/cases/${sample.id}`}
                  className={cn(buttonVariants(), "justify-between")}
                >
                  Load sample case
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
