import { jsPDF } from "jspdf";
import type { CaseDTO } from "@/lib/types";
import { formatCaseType, formatDate } from "@/lib/format";
import { reviewDisclaimer } from "@/lib/sample-data";

function addWrapped(doc: jsPDF, text: string, x: number, y: number, width: number) {
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}

export function buildCasePdf(caseRecord: CaseDTO) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  let y = 18;

  doc.setFillColor(244, 249, 247);
  doc.rect(0, 0, 216, 279, "F");
  doc.setTextColor(26, 45, 52);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("PanicProof Evidence Summary", 16, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(78, 96, 101);
  doc.text(formatCaseType(caseRecord.caseType), 16, y);
  doc.text(`Generated ${formatDate(new Date())}`, 156, y);
  y += 9;

  doc.setDrawColor(194, 213, 208);
  doc.setLineWidth(0.3);
  doc.line(16, y, 200, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(26, 45, 52);
  y = addWrapped(doc, caseRecord.title, 16, y, 184) + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(54, 72, 78);
  y = addWrapped(doc, caseRecord.summary || "No summary generated yet.", 16, y, 184) + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 45, 52);
  doc.text("Key facts", 16, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  caseRecord.facts.slice(0, 8).forEach((fact) => {
    y = addWrapped(doc, `${fact.key}: ${fact.value}`, 18, y, 178) + 2;
  });

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Next actions", 16, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  caseRecord.actions.slice(0, 5).forEach((action) => {
    const due = action.dueDate ? ` Due ${formatDate(action.dueDate)}.` : "";
    y = addWrapped(
      doc,
      `[${action.priority.toUpperCase()}] ${action.title}.${due} ${action.description}`,
      18,
      y,
      178
    ) + 2;
  });

  if (y > 225) {
    doc.addPage();
    y = 18;
  } else {
    y += 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Evidence list", 16, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  caseRecord.artifacts.forEach((artifact) => {
    y = addWrapped(doc, `${artifact.fileName}: ${artifact.extractedText.slice(0, 160)}`, 18, y, 178) + 2;
  });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(91, 108, 113);
  addWrapped(doc, reviewDisclaimer, 16, 262, 184);

  return Buffer.from(doc.output("arraybuffer"));
}
