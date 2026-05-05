import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArtifactKind } from "@/lib/types";

type ExtractedUpload = {
  kind: ArtifactKind;
  fileName: string;
  mimeType: string;
  localPath: string;
  extractedText: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-");
}

function artifactKind(file: File): ArtifactKind {
  const mimeType = file.type || "application/octet-stream";
  if (mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (mimeType.startsWith("image/")) return "screenshot";
  if (mimeType.includes("message") || file.name.toLowerCase().includes("email")) {
    return "email";
  }
  return "text";
}

async function extractPdfText(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({
    data: bytes,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item: { str?: string }) => item.str ?? "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  return pages.join("\n\n");
}

async function persistUpload(caseId: string, fileName: string, bytes: Uint8Array) {
  if (process.env.VERCEL === "1") return "";

  const uploadDir = path.join(process.cwd(), "public", "uploads", caseId);
  await mkdir(uploadDir, { recursive: true });
  const safeName = sanitizeFileName(fileName);
  await writeFile(path.join(uploadDir, safeName), bytes);
  return `/uploads/${caseId}/${safeName}`;
}

export async function extractUpload(caseId: string, file: File): Promise<ExtractedUpload> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const kind = artifactKind(file);
  const localPath = await persistUpload(caseId, file.name, bytes);

  if (kind === "pdf") {
    const extractedText = await extractPdfText(bytes).catch(() =>
      "PDF uploaded. Text extraction could not read this file; review the original artifact manually."
    );
    return {
      kind,
      fileName: file.name,
      mimeType,
      localPath,
      extractedText,
    };
  }

  if (
    mimeType.startsWith("text/") ||
    file.name.toLowerCase().endsWith(".txt") ||
    file.name.toLowerCase().endsWith(".md")
  ) {
    return {
      kind,
      fileName: file.name,
      mimeType,
      localPath,
      extractedText: Buffer.from(bytes).toString("utf8"),
    };
  }

  return {
    kind,
    fileName: file.name,
    mimeType,
    localPath,
    extractedText:
      "Image or screenshot uploaded. Demo mode stores the artifact and asks the user to review or edit extracted facts manually. Add OPENROUTER_API_KEY to use model-assisted extraction.",
  };
}
