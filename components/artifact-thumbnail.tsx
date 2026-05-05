import Image from "next/image";
import {
  FileImageIcon,
  FileTextIcon,
  MailIcon,
  ReceiptTextIcon,
} from "lucide-react";
import type { ArtifactDTO } from "@/lib/types";
import { truncate } from "@/lib/format";

export function ArtifactThumbnail({ artifact }: { artifact: ArtifactDTO }) {
  const isImage = artifact.mimeType.startsWith("image/") && artifact.localPath;

  return (
    <div className="flex gap-3 rounded-lg border bg-white p-3 shadow-sm">
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-teal-50 text-teal-700">
        {isImage ? (
          <Image
            src={artifact.localPath}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : artifact.kind === "email" ? (
          <MailIcon aria-hidden="true" />
        ) : artifact.fileName.toLowerCase().includes("receipt") ? (
          <ReceiptTextIcon aria-hidden="true" />
        ) : artifact.kind === "screenshot" ? (
          <FileImageIcon aria-hidden="true" />
        ) : (
          <FileTextIcon aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {artifact.fileName}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {truncate(artifact.extractedText, 118)}
        </p>
      </div>
    </div>
  );
}
