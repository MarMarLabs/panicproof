import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  FileTextIcon,
  PencilLineIcon,
  SparklesIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadZone } from "@/components/upload-zone";
import { ReviewDisclaimer } from "@/components/review-disclaimer";
import { sampleCases } from "@/lib/sample-data";
import { CASE_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const beforeItems = [
  "Cancellation email buried in inbox",
  "Receipt total in a separate PDF",
  "Deadline implied by support wording",
];

const afterItems = [
  "Facts normalized and editable",
  "Deadline placed on timeline",
  "Draft message and PDF summary ready",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="paper-grid border-b bg-[linear-gradient(180deg,#fbfefc_0%,#f1f8f5_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
                <SparklesIcon aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-bold tracking-tight text-slate-950">
                  PanicProof
                </span>
                <span className="block text-xs font-medium text-slate-500">
                  Calm action boards for messy problems
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/samples"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Samples
              </Link>
              <a href="#start" className={buttonVariants({ size: "sm" })}>
                Start
              </a>
            </nav>
          </header>

          <div className="grid items-center gap-10 pb-12 pt-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:pb-16 lg:pt-10">
            <div className="flex max-w-3xl flex-col gap-7">
              <div className="flex flex-col gap-4">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  PanicProof turns consumer chaos into a calm action board.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Upload receipts, support threads, cancellation notices, or
                  lease notes. PanicProof extracts the facts, builds a timeline,
                  prioritizes next steps, drafts messages, and exports a clean
                  one-page evidence summary.
                </p>
              </div>

              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                {sampleCases.map((sample) => (
                  <Link
                    key={sample.id}
                    href={`/cases/${sample.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto justify-start rounded-lg border-teal-200 bg-white/80 p-3 text-left hover:bg-teal-50"
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        Load sample case
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {CASE_TYPE_LABELS[sample.caseType]}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              <ReviewDisclaimer compact />
            </div>

            <div id="start" className="scroll-mt-8">
              <UploadZone />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-center gap-4">
          <Badge variant="secondary" className="w-fit rounded-md">
            Before / After
          </Badge>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-950">
            From scattered proof to a reviewed plan in one workspace.
          </h2>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            The MVP keeps every generated fact and action editable. Demo mode
            uses deterministic seeded outputs, while OpenRouter structured JSON
            generation can be enabled later with an API key.
          </p>
        </div>

        <Card className="overflow-hidden border-teal-100 shadow-xl shadow-teal-900/5">
          <CardContent className="grid gap-0 p-0 md:grid-cols-2">
            <div className="border-b bg-slate-50 p-6 md:border-b-0 md:border-r">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileTextIcon aria-hidden="true" />
                Before
              </div>
              <div className="flex flex-col gap-3">
                {beforeItems.map((item) => (
                  <div key={item} className="rounded-lg border bg-white p-3 text-sm text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-800">
                <CheckCircle2Icon aria-hidden="true" />
                After
              </div>
              <div className="flex flex-col gap-3">
                {afterItems.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50/70 p-3 text-sm text-teal-950"
                  >
                    {index === 1 ? (
                      <CalendarClockIcon aria-hidden="true" />
                    ) : index === 2 ? (
                      <PencilLineIcon aria-hidden="true" />
                    ) : (
                      <CheckCircle2Icon aria-hidden="true" />
                    )}
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Built-in scenarios
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Seeded data and sample files make the app demoable immediately.
              </p>
            </div>
            <Link
              href="/samples"
              className={buttonVariants({ variant: "outline" })}
            >
              View all samples
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {sampleCases.map((sample) => (
              <Card key={sample.id} className="border-teal-100">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <Badge variant="secondary" className="w-fit rounded-md">
                    {CASE_TYPE_LABELS[sample.caseType]}
                  </Badge>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="font-semibold text-slate-950">{sample.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{sample.blurb}</p>
                  </div>
                  <Link
                    href={`/cases/${sample.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-between"
                    )}
                  >
                    Open sample
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
