import type { FactDTO } from "@/lib/types";

type GeneratedAction = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string | null;
  status: "todo" | "done";
  rationale: string;
};

function findFact(facts: Array<Pick<FactDTO, "category" | "key" | "value">>, terms: string[]) {
  return facts.find((fact) => {
    const haystack = `${fact.category} ${fact.key} ${fact.value}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}

function deadlineDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function generateActionsFromFacts(
  caseType: string,
  facts: Array<Pick<FactDTO, "category" | "key" | "value">>
): GeneratedAction[] {
  const deadline = findFact(facts, ["deadline", "submit", "escalate", "by"]);
  const amount = findFact(facts, ["amount", "$", "total", "deduction"]);
  const promise = findFact(facts, ["promise", "policy", "clause", "instruction"]);
  const evidence = findFact(facts, ["evidence", "tracking", "locator", "inspection"]);

  const dueDate = deadlineDate(deadline?.value);
  const commonEvidence = evidence?.value
    ? `Use "${evidence.value}" as the lead evidence reference.`
    : "Put the strongest artifact first and label every attachment clearly.";

  if (caseType === "security_deposit") {
    return [
      {
        title: "Request itemized deductions in writing",
        description:
          "Ask for each charge, the amount, the reason, and supporting photos or invoices before accepting any deduction.",
        priority: "high",
        dueDate,
        status: "todo",
        rationale:
          promise?.value ??
          "The evidence suggests the deduction should be reviewed against the lease terms and move-out condition.",
      },
      {
        title: "Attach the move-out condition evidence",
        description: commonEvidence,
        priority: "medium",
        dueDate: null,
        status: "todo",
        rationale:
          "The strongest response ties each disputed charge to a specific document or inspection note.",
      },
      {
        title: "Create a simple deposit ledger",
        description: `List deposit paid, claimed deductions, and requested return amount${
          amount?.value ? ` using ${amount.value}` : ""
        }.`,
        priority: "low",
        dueDate: null,
        status: "todo",
        rationale:
          "A ledger makes the amount in dispute easy to scan and export.",
      },
    ];
  }

  if (caseType === "chargeback_refund") {
    return [
      {
        title: "Send a final refund-status request",
        description:
          "Include the order number, return delivery proof, refund policy, amount, and a clear request for the expected posting date.",
        priority: "high",
        dueDate,
        status: "todo",
        rationale:
          promise?.value ??
          "The merchant should be asked to reconcile the refund status against its stated policy.",
      },
      {
        title: "Prepare a card issuer evidence packet",
        description:
          "Bundle the receipt, policy, return tracking, support thread, and the final merchant message.",
        priority: "medium",
        dueDate: null,
        status: "todo",
        rationale:
          "A complete packet makes any later chargeback conversation more focused.",
      },
      {
        title: "Log every support touchpoint",
        description:
          "Track date, channel, representative, and exact promise for each merchant interaction.",
        priority: "low",
        dueDate: null,
        status: "todo",
        rationale:
          "A dated log helps identify missed promises and escalation timing.",
      },
    ];
  }

  return [
    {
      title: "Submit the reimbursement packet",
      description:
        "Attach the cancellation notice, travel proof, receipt totals, and a concise explanation of what happened.",
      priority: "high",
      dueDate,
      status: "todo",
      rationale:
        promise?.value ??
        "The artifact set includes an instruction or policy that should be answered while the evidence is fresh.",
    },
    {
      title: "Ask support for a claim reference",
      description:
        "Send a short message asking support to confirm the upload link, claim number, and expected review window.",
      priority: "medium",
      dueDate: null,
      status: "todo",
      rationale:
        "A reference number gives the user something concrete to cite in follow-up messages.",
    },
    {
      title: "Rename and order the evidence files",
      description:
        "Name files with dates, vendors, and totals so the exported summary is easy to audit.",
      priority: "low",
      dueDate: null,
      status: "todo",
      rationale:
        "Clean filenames reduce review friction when attachments are submitted.",
    },
  ];
}
