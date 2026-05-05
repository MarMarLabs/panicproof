"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  ArrowRightIcon,
  FileUpIcon,
  Loader2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CASE_TYPE_LABELS, CASE_TYPES, type CaseType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("My consumer issue");
  const [caseType, setCaseType] = useState<CaseType>("flight_cancellation");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((current) => [...current, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"],
    },
  });

  const fileLabel = useMemo(() => {
    if (!files.length) return "Drop PDFs, screenshots, receipts, or text notes";
    return `${files.length} artifact${files.length === 1 ? "" : "s"} ready`;
  }, [files.length]);

  async function createCase() {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("title", title || "Untitled case");
    formData.set("caseType", caseType);
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/cases", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setIsSubmitting(false);
      toast.error("Could not create the case. Check the upload and try again.");
      return;
    }

    const payload = (await response.json()) as { case: { id: string } };
    toast.success("Case created and analyzed in demo mode.");
    router.push(`/cases/${payload.case.id}`);
  }

  return (
    <Card className="border-teal-100 bg-white/95 shadow-xl shadow-teal-900/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Start with your evidence</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="case-title">Case title</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Delayed refund for order..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="case-type">Case type</Label>
            <select
              id="case-type"
              value={caseType}
              onChange={(event) => setCaseType(event.target.value as CaseType)}
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {CASE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CASE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-teal-500 bg-teal-50"
              : "border-teal-200 bg-teal-50/50 hover:bg-teal-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex size-12 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
            <UploadCloudIcon aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{fileLabel}</p>
            <p className="mt-1 text-xs text-slate-600">
              PDF text extraction is local; image OCR is review-first in demo mode.
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                key={`${file.name}-${file.size}`}
                className="inline-flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-xs text-slate-700"
              >
                <FileUpIcon aria-hidden="true" />
                {file.name}
              </span>
            ))}
          </div>
        )}

        <Button
          size="lg"
          className="justify-between"
          onClick={createCase}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              Building the board
              <Loader2Icon data-icon="inline-end" className="animate-spin" />
            </>
          ) : (
            <>
              Create action board
              <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
