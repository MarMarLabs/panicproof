"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArtifactThumbnail } from "@/components/artifact-thumbnail";
import { CaseTypeBadge } from "@/components/case-type-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { ReviewDisclaimer } from "@/components/review-disclaimer";
import { caseConfidence, formatDate, formatDateTime, titleize } from "@/lib/format";
import type { CaseDTO, FactDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type CaseWorkbenchProps = {
  initialCase: CaseDTO;
};

type FactForm = {
  id?: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
  sourceArtifactId: string;
  editable: boolean;
};

type FactFormValues = {
  facts: FactForm[];
};

function factToForm(fact: FactDTO): FactForm {
  return {
    id: fact.id,
    category: fact.category,
    key: fact.key,
    value: fact.value,
    confidence: fact.confidence,
    sourceArtifactId: fact.sourceArtifactId ?? "",
    editable: fact.editable,
  };
}

function confidenceTone(confidence: number) {
  if (confidence >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (confidence >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function CaseWorkbench({ initialCase }: CaseWorkbenchProps) {
  const [caseRecord, setCaseRecord] = useState(initialCase);
  const [isSavingFacts, setIsSavingFacts] = useState(false);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const [isRegeneratingDrafts, setIsRegeneratingDrafts] = useState(false);
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);

  const confidence = caseConfidence(caseRecord.facts);
  const form = useForm<FactFormValues>({
    defaultValues: {
      facts: caseRecord.facts.map(factToForm),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "facts",
    keyName: "fieldId",
  });

  async function saveFacts(values: FactFormValues = form.getValues()) {
    setIsSavingFacts(true);
    const response = await fetch(`/api/cases/${caseRecord.id}/analyze`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facts: values.facts.map((fact) => ({
          ...fact,
          confidence: Number(fact.confidence),
          sourceArtifactId: fact.sourceArtifactId || null,
          editable: true,
        })),
      }),
    });
    setIsSavingFacts(false);

    if (!response.ok) {
      toast.error("Fact edits could not be saved.");
      return null;
    }

    const payload = (await response.json()) as { case: CaseDTO };
    setCaseRecord(payload.case);
    form.reset({ facts: payload.case.facts.map(factToForm) });
    toast.success("Facts saved for review.");
    return payload.case;
  }

  async function generateActions() {
    setIsGeneratingActions(true);
    const saved = await saveFacts();
    if (!saved) {
      setIsGeneratingActions(false);
      return;
    }

    const response = await fetch(`/api/cases/${caseRecord.id}/actions`, {
      method: "POST",
    });
    setIsGeneratingActions(false);

    if (!response.ok) {
      toast.error("Action plan could not be regenerated.");
      return;
    }

    const payload = (await response.json()) as { case: CaseDTO };
    setCaseRecord(payload.case);
    toast.success("Action plan regenerated from edited facts.");
  }

  async function regenerateDrafts() {
    setIsRegeneratingDrafts(true);
    const response = await fetch(`/api/cases/${caseRecord.id}/drafts`, {
      method: "POST",
    });
    setIsRegeneratingDrafts(false);

    if (!response.ok) {
      toast.error("Drafts could not be regenerated.");
      return;
    }

    const payload = (await response.json()) as { case: CaseDTO };
    setCaseRecord(payload.case);
    toast.success("Drafts regenerated.");
  }

  async function patchAction(
    actionId: string,
    patch: Record<string, string | null>
  ) {
    setUpdatingActionId(actionId);
    const response = await fetch(`/api/cases/${caseRecord.id}/actions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: actionId, ...patch }),
    });
    setUpdatingActionId(null);

    if (!response.ok) {
      toast.error("Action update could not be saved.");
      return;
    }

    const payload = (await response.json()) as { case: CaseDTO };
    setCaseRecord(payload.case);
  }

  async function copyDraft(body: string) {
    await navigator.clipboard.writeText(body);
    toast.success("Draft copied.");
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                aria-label="Back home"
              >
                <ArrowLeftIcon aria-hidden="true" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {caseRecord.title}
                </h1>
                <p className="text-xs text-slate-500">
                  Updated {formatDateTime(caseRecord.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CaseTypeBadge caseType={caseRecord.caseType} />
              <Badge
                variant="outline"
                className={cn("h-7 rounded-md border", confidenceTone(confidence))}
              >
                {confidence}% confidence
              </Badge>
              <a
                href={`/api/cases/${caseRecord.id}/export`}
                download
                className={buttonVariants({ size: "sm" })}
              >
                <DownloadIcon data-icon="inline-start" />
                Export PDF
              </a>
            </div>
          </div>
          <ReviewDisclaimer compact />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)_360px] lg:px-8">
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {caseRecord.artifacts.length ? (
                caseRecord.artifacts.map((artifact) => (
                  <ArtifactThumbnail key={artifact.id} artifact={artifact} />
                ))
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SparklesIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No artifacts yet</EmptyTitle>
                    <EmptyDescription>
                      Upload a file from the home page to start extracting text.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-5">
          <Card className="border-teal-100">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Case summary</CardTitle>
                <Badge variant="secondary" className="rounded-md">
                  Reviewable
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-700">
                {caseRecord.summary || "Run analysis to generate a concise summary."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Editable facts</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Correct these before generating the final action list.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        category: "evidence",
                        key: "New fact",
                        value: "",
                        confidence: 0.5,
                        sourceArtifactId: "",
                        editable: true,
                      })
                    }
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add fact
                  </Button>
                  <Button
                    size="sm"
                    onClick={form.handleSubmit((values) => saveFacts(values))}
                    disabled={isSavingFacts}
                  >
                    {isSavingFacts ? (
                      <Loader2Icon data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <SaveIcon data-icon="inline-start" />
                    )}
                    Save facts
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {fields.length ? (
                fields.map((field, index) => (
                  <div
                    key={field.fieldId}
                    className="grid gap-3 rounded-lg border bg-white p-3 md:grid-cols-[130px_1fr_1.3fr_86px_40px]"
                  >
                    <input
                      type="hidden"
                      defaultValue={field.id}
                      {...form.register(`facts.${index}.id`)}
                    />
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Category</Label>
                      <Input
                        {...form.register(`facts.${index}.category`)}
                        aria-label="Category"
                        defaultValue={field.category}
                        className="h-8"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Key</Label>
                      <Input
                        {...form.register(`facts.${index}.key`)}
                        aria-label="Key"
                        defaultValue={field.key}
                        className="h-8"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Value</Label>
                      <Textarea
                        {...form.register(`facts.${index}.value`)}
                        aria-label="Value"
                        defaultValue={field.value}
                        className="min-h-8 resize-y text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Confidence</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        aria-label="Confidence"
                        defaultValue={field.confidence}
                        {...form.register(`facts.${index}.confidence`, {
                          valueAsNumber: true,
                        })}
                        className="h-8"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label="Remove fact"
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="md:col-span-5">
                      <Label className="mb-1.5 block text-xs">Source artifact</Label>
                      <select
                        {...form.register(`facts.${index}.sourceArtifactId`)}
                        defaultValue={field.sourceArtifactId}
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="">Manual / no single source</option>
                        {caseRecord.artifacts.map((artifact) => (
                          <option key={artifact.id} value={artifact.id}>
                            {artifact.fileName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PencilIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No facts extracted yet</EmptyTitle>
                    <EmptyDescription>
                      Run analysis or add facts manually before making actions.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      onClick={() =>
                        append({
                          category: "evidence",
                          key: "New fact",
                          value: "",
                          confidence: 0.5,
                          sourceArtifactId: "",
                          editable: true,
                        })
                      }
                    >
                      <PlusIcon data-icon="inline-start" />
                      Add first fact
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Prioritized actions</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
                    Titles and descriptions are editable; completion syncs immediately.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={generateActions}
                  disabled={isGeneratingActions}
                >
                  {isGeneratingActions ? (
                    <Loader2Icon data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <RefreshCwIcon data-icon="inline-start" />
                  )}
                  Generate action plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isGeneratingActions && (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              )}
              {!isGeneratingActions && caseRecord.actions.length ? (
                caseRecord.actions.map((action) => (
                  <div
                    key={action.id}
                    className={cn(
                      "rounded-xl border bg-white p-4 shadow-sm",
                      action.status === "done" && "bg-slate-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={action.status === "done"}
                        onChange={(event) =>
                          patchAction(action.id, {
                            status: event.currentTarget.checked ? "done" : "todo",
                          })
                        }
                        className="mt-1 size-4 accent-teal-700"
                        aria-label={`Mark ${action.title} complete`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <PriorityBadge priority={action.priority} />
                          <Badge variant="outline" className="rounded-md bg-white">
                            {action.dueDate ? formatDate(action.dueDate) : "No deadline"}
                          </Badge>
                          {updatingActionId === action.id && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Loader2Icon className="animate-spin" aria-hidden="true" />
                              Saving
                            </span>
                          )}
                        </div>
                        <Input
                          aria-label="Action title"
                          defaultValue={action.title}
                          onBlur={(event) =>
                            patchAction(action.id, { title: event.currentTarget.value })
                          }
                          className="mb-2 h-9 font-semibold"
                        />
                        <Textarea
                          aria-label="Action description"
                          defaultValue={action.description}
                          onBlur={(event) =>
                            patchAction(action.id, {
                              description: event.currentTarget.value,
                            })
                          }
                          className="min-h-16 resize-y text-sm"
                        />
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Rationale: {action.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !isGeneratingActions && (
                  <Empty className="border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SparklesIcon aria-hidden="true" />
                      </EmptyMedia>
                      <EmptyTitle>No action plan yet</EmptyTitle>
                      <EmptyDescription>
                        Save reviewed facts, then generate 3 to 7 prioritized next steps.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {caseRecord.timeline.length ? (
                <ol className="relative flex flex-col gap-4 border-l border-teal-200 pl-4">
                  {caseRecord.timeline.map((event) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[21px] top-1 flex size-3 rounded-full border-2 border-white bg-teal-600" />
                      <p className="text-sm font-semibold text-slate-900">
                        {event.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(event.eventDate)}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyTitle>No dates yet</EmptyTitle>
                    <EmptyDescription>
                      Timeline events appear after analysis.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Drafts</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateDrafts}
                  disabled={isRegeneratingDrafts}
                >
                  {isRegeneratingDrafts ? (
                    <Loader2Icon data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <RefreshCwIcon data-icon="inline-start" />
                  )}
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isRegeneratingDrafts && (
                <>
                  <Skeleton className="h-36 rounded-lg" />
                  <Skeleton className="h-36 rounded-lg" />
                </>
              )}
              {!isRegeneratingDrafts && caseRecord.drafts.length ? (
                caseRecord.drafts.map((draft) => (
                  <div key={draft.id} className="rounded-xl border bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {draft.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {titleize(draft.channel)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyDraft(draft.body)}
                        aria-label={`Copy ${draft.title}`}
                      >
                        <ClipboardCopyIcon aria-hidden="true" />
                      </Button>
                    </div>
                    <Textarea
                      defaultValue={draft.body}
                      aria-label={`${draft.title} body`}
                      className="min-h-44 resize-y text-sm leading-6"
                    />
                  </div>
                ))
              ) : (
                !isRegeneratingDrafts && (
                  <Empty className="border">
                    <EmptyHeader>
                      <EmptyTitle>No drafts yet</EmptyTitle>
                      <EmptyDescription>
                        Generate drafts after facts and actions look right.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )
              )}
              <Separator />
              <a
                href={`/api/cases/${caseRecord.id}/export`}
                download
                className={cn(buttonVariants({ size: "lg" }), "justify-between")}
              >
                Export polished PDF
                <DownloadIcon data-icon="inline-end" />
              </a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
