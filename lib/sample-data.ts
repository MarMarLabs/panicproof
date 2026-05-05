import type { SampleDefinition } from "@/lib/types";

export const reviewDisclaimer =
  "PanicProof organizes evidence and drafts plain-language messages. It is not legal advice. Review every generated fact, action, and message before sending.";

export const sampleCases: SampleDefinition[] = [
  {
    id: "sample-flight",
    title: "Gate-change cancellation after missed connection",
    caseType: "flight_cancellation",
    status: "ready",
    route: "Flight cancellation",
    blurb:
      "A canceled connection, a hotel receipt, and an airline email that need a clear reimbursement packet.",
    summary:
      "A Denver to Chicago connection was canceled after a delay and gate change on April 26, 2026. The traveler paid $218.42 for a hotel and has a written airline notice offering reimbursement review for reasonable overnight expenses.",
    artifacts: [
      {
        id: "artifact-flight-boarding",
        kind: "text",
        fileName: "boarding-pass.txt",
        mimeType: "text/plain",
        localPath: "/samples/flight/boarding-pass.txt",
        extractedText:
          "Boarding pass: Maya Chen, Record locator H7Q2M9, April 26 2026. Flight OA 1842 Austin AUS to Denver DEN seat 18C. Connection OA 742 Denver DEN to Chicago ORD scheduled 7:35 PM. Boarding group 4. Gate B22 changed to C14 at 6:58 PM.",
      },
      {
        id: "artifact-flight-email",
        kind: "email",
        fileName: "cancellation-email.txt",
        mimeType: "text/plain",
        localPath: "/samples/flight/cancellation-email.txt",
        extractedText:
          "Email from Oceanic Air Support, April 26 2026 8:12 PM: Your flight OA 742 Denver to Chicago has been canceled due to crew availability after earlier operational delays. We can rebook you on OA 606 leaving April 27 at 9:10 AM. Keep receipts for reasonable overnight hotel and meal expenses and submit them within 14 days for reimbursement review.",
      },
      {
        id: "artifact-flight-hotel",
        kind: "text",
        fileName: "hotel-receipt.txt",
        mimeType: "text/plain",
        localPath: "/samples/flight/hotel-receipt.txt",
        extractedText:
          "Summit Stay Hotel receipt for Maya Chen. Check-in April 26 2026, check-out April 27 2026. Room charge $189.00, taxes $29.42, total paid Visa ending 4481: $218.42. Address 901 Peña Blvd, Denver, CO.",
      },
    ],
    facts: [
      {
        id: "fact-flight-party-airline",
        category: "parties",
        key: "Airline",
        value: "Oceanic Air",
        confidence: 0.94,
        sourceArtifactId: "artifact-flight-email",
        editable: true,
      },
      {
        id: "fact-flight-party-traveler",
        category: "parties",
        key: "Traveler",
        value: "Maya Chen",
        confidence: 0.96,
        sourceArtifactId: "artifact-flight-boarding",
        editable: true,
      },
      {
        id: "fact-flight-date-cancel",
        category: "dates",
        key: "Cancellation notice",
        value: "April 26, 2026 at 8:12 PM",
        confidence: 0.92,
        sourceArtifactId: "artifact-flight-email",
        editable: true,
      },
      {
        id: "fact-flight-amount-hotel",
        category: "amounts",
        key: "Hotel receipt total",
        value: "$218.42",
        confidence: 0.98,
        sourceArtifactId: "artifact-flight-hotel",
        editable: true,
      },
      {
        id: "fact-flight-promise",
        category: "promises",
        key: "Airline reimbursement instruction",
        value:
          "Keep receipts for reasonable overnight hotel and meal expenses and submit within 14 days.",
        confidence: 0.89,
        sourceArtifactId: "artifact-flight-email",
        editable: true,
      },
      {
        id: "fact-flight-deadline",
        category: "deadlines",
        key: "Submit receipts by",
        value: "May 10, 2026",
        confidence: 0.83,
        sourceArtifactId: "artifact-flight-email",
        editable: true,
      },
      {
        id: "fact-flight-evidence",
        category: "evidence",
        key: "Record locator",
        value: "H7Q2M9",
        confidence: 0.93,
        sourceArtifactId: "artifact-flight-boarding",
        editable: true,
      },
    ],
    timeline: [
      {
        id: "timeline-flight-gate",
        label: "Gate changed from B22 to C14",
        eventDate: "2026-04-26T18:58:00.000Z",
        sourceArtifactId: "artifact-flight-boarding",
      },
      {
        id: "timeline-flight-cancel",
        label: "OA 742 cancellation email received",
        eventDate: "2026-04-26T20:12:00.000Z",
        sourceArtifactId: "artifact-flight-email",
      },
      {
        id: "timeline-flight-hotel",
        label: "Hotel expense paid",
        eventDate: "2026-04-27T05:30:00.000Z",
        sourceArtifactId: "artifact-flight-hotel",
      },
    ],
    actions: [
      {
        id: "action-flight-submit",
        title: "Submit reimbursement packet before the 14-day window closes",
        description:
          "Attach the cancellation email, hotel receipt, boarding pass, and a short explanation of the missed connection.",
        priority: "high",
        dueDate: "2026-05-10T18:00:00.000Z",
        status: "todo",
        rationale:
          "The airline email states receipts should be submitted within 14 days for reimbursement review.",
      },
      {
        id: "action-flight-confirm",
        title: "Ask support to confirm the claim reference number",
        description:
          "Send the draft support message and save the reply with any case or claim number.",
        priority: "medium",
        dueDate: "2026-05-07T18:00:00.000Z",
        status: "todo",
        rationale:
          "A reference number makes follow-up easier if reimbursement stalls.",
      },
      {
        id: "action-flight-organize",
        title: "Rename receipts with dates and totals",
        description:
          "Use file names like 2026-04-26-hotel-218.42.pdf before submitting.",
        priority: "low",
        dueDate: null,
        status: "todo",
        rationale:
          "Clear evidence labels reduce back-and-forth and support a one-page summary.",
      },
    ],
    drafts: [
      {
        id: "draft-flight-email",
        channel: "email",
        title: "Email reimbursement request",
        body:
          "Hello Oceanic Air Support,\n\nI am requesting reimbursement review for reasonable overnight expenses caused by the cancellation of OA 742 from Denver to Chicago on April 26, 2026. My record locator is H7Q2M9. Your April 26 email instructed me to keep receipts and submit them within 14 days.\n\nAttached are the cancellation email, boarding pass, and Summit Stay Hotel receipt totaling $218.42. Please confirm that this packet is complete and share the claim reference number.\n\nThank you,\nMaya Chen",
      },
      {
        id: "draft-flight-support",
        channel: "support_chat",
        title: "Support chat message",
        body:
          "Hi, I need help submitting a reimbursement packet for canceled flight OA 742 on April 26, 2026. Record locator H7Q2M9. I have the cancellation email and a hotel receipt for $218.42. Can you confirm the upload link and the claim/reference number?",
      },
    ],
  },
  {
    id: "sample-deposit",
    title: "Deposit deductions after documented move-out",
    caseType: "security_deposit",
    status: "ready",
    route: "Security deposit",
    blurb:
      "A lease excerpt, move-out note, and landlord message become a deadline-aware deposit response.",
    summary:
      "A tenant moved out on April 30, 2026 after a documented inspection. The landlord later proposed keeping $650 of a $1,900 deposit for painting and cleaning, while the lease states ordinary wear is not charged to the tenant.",
    artifacts: [
      {
        id: "artifact-deposit-lease",
        kind: "text",
        fileName: "lease-clause-excerpt.txt",
        mimeType: "text/plain",
        localPath: "/samples/deposit/lease-clause-excerpt.txt",
        extractedText:
          "Lease section 9: Security Deposit. Deposit amount $1,900. Landlord may deduct unpaid rent, documented damage beyond ordinary wear, and cleaning required to return the unit to the condition at move-in. Ordinary wear, fading paint, and routine turnover cleaning are not tenant charges.",
      },
      {
        id: "artifact-deposit-inspection",
        kind: "text",
        fileName: "move-out-inspection-note.txt",
        mimeType: "text/plain",
        localPath: "/samples/deposit/move-out-inspection-note.txt",
        extractedText:
          "Move-out inspection note dated April 30, 2026. Tenant: Jordan Rivera. Unit 4B. Manager wrote: keys returned, no visible wall damage, floors swept, refrigerator empty, minor nail holes in living room. Photos taken at 10:18 AM.",
      },
      {
        id: "artifact-deposit-message",
        kind: "screenshot",
        fileName: "landlord-message-screenshot.svg",
        mimeType: "image/svg+xml",
        localPath: "/samples/deposit/landlord-message-screenshot.svg",
        extractedText:
          "Text message from Westline Properties on May 3, 2026: We plan to retain $650 from the deposit for repainting and cleaning. Statement will be mailed later this month.",
      },
    ],
    facts: [
      {
        id: "fact-deposit-party-landlord",
        category: "parties",
        key: "Landlord",
        value: "Westline Properties",
        confidence: 0.9,
        sourceArtifactId: "artifact-deposit-message",
        editable: true,
      },
      {
        id: "fact-deposit-party-tenant",
        category: "parties",
        key: "Tenant",
        value: "Jordan Rivera",
        confidence: 0.94,
        sourceArtifactId: "artifact-deposit-inspection",
        editable: true,
      },
      {
        id: "fact-deposit-amount",
        category: "amounts",
        key: "Deposit amount",
        value: "$1,900",
        confidence: 0.98,
        sourceArtifactId: "artifact-deposit-lease",
        editable: true,
      },
      {
        id: "fact-deposit-deduction",
        category: "amounts",
        key: "Proposed deduction",
        value: "$650 for repainting and cleaning",
        confidence: 0.91,
        sourceArtifactId: "artifact-deposit-message",
        editable: true,
      },
      {
        id: "fact-deposit-promise",
        category: "promises",
        key: "Lease wear-and-tear clause",
        value:
          "Ordinary wear, fading paint, and routine turnover cleaning are not tenant charges.",
        confidence: 0.88,
        sourceArtifactId: "artifact-deposit-lease",
        editable: true,
      },
      {
        id: "fact-deposit-deadline",
        category: "deadlines",
        key: "Ask for itemized statement by",
        value: "May 10, 2026",
        confidence: 0.72,
        sourceArtifactId: null,
        editable: true,
      },
      {
        id: "fact-deposit-evidence",
        category: "evidence",
        key: "Move-out condition",
        value:
          "No visible wall damage, floors swept, refrigerator empty, minor nail holes.",
        confidence: 0.86,
        sourceArtifactId: "artifact-deposit-inspection",
        editable: true,
      },
    ],
    timeline: [
      {
        id: "timeline-deposit-lease",
        label: "Lease deposit clause signed",
        eventDate: "2025-05-01T14:00:00.000Z",
        sourceArtifactId: "artifact-deposit-lease",
      },
      {
        id: "timeline-deposit-moveout",
        label: "Move-out inspection completed",
        eventDate: "2026-04-30T15:18:00.000Z",
        sourceArtifactId: "artifact-deposit-inspection",
      },
      {
        id: "timeline-deposit-deduction",
        label: "Landlord proposed $650 deduction",
        eventDate: "2026-05-03T17:30:00.000Z",
        sourceArtifactId: "artifact-deposit-message",
      },
    ],
    actions: [
      {
        id: "action-deposit-itemized",
        title: "Request an itemized deduction statement and supporting receipts",
        description:
          "Ask the landlord to identify each charge, amount, date, and supporting invoice before accepting the deduction.",
        priority: "high",
        dueDate: "2026-05-10T18:00:00.000Z",
        status: "todo",
        rationale:
          "The proposed $650 deduction is broad, while the lease distinguishes ordinary wear from chargeable damage.",
      },
      {
        id: "action-deposit-photo",
        title: "Attach the move-out inspection note and photo index",
        description:
          "Use the inspection note as the top evidence item and reference the 10:18 AM photos.",
        priority: "medium",
        dueDate: "2026-05-08T18:00:00.000Z",
        status: "todo",
        rationale:
          "The move-out note directly counters repainting and cleaning charges.",
      },
      {
        id: "action-deposit-ledger",
        title: "Make a deposit ledger",
        description:
          "List deposit paid, deduction claimed, undisputed amount, and the requested return amount.",
        priority: "low",
        dueDate: null,
        status: "todo",
        rationale:
          "A simple ledger makes the response easier to review.",
      },
    ],
    drafts: [
      {
        id: "draft-deposit-email",
        channel: "email",
        title: "Deposit deduction response",
        body:
          "Hello Westline Properties,\n\nI received your May 3 message stating that $650 may be retained from my $1,900 security deposit for repainting and cleaning. Before I can review that deduction, please send an itemized statement showing each charge, the reason for the charge, and supporting invoices or photos.\n\nFor context, the April 30 move-out note states that keys were returned, there was no visible wall damage, the floors were swept, the refrigerator was empty, and only minor nail holes were noted. The lease also says ordinary wear, fading paint, and routine turnover cleaning are not tenant charges.\n\nPlease confirm when the itemized statement will be sent.\n\nThank you,\nJordan Rivera",
      },
      {
        id: "draft-deposit-support",
        channel: "call_script",
        title: "Call script",
        body:
          "I am calling about the proposed $650 deposit deduction. I am not refusing to review it, but I need an itemized statement and supporting receipts first. My move-out inspection note says there was no visible wall damage and only minor nail holes. What date will the statement be sent?",
      },
    ],
  },
  {
    id: "sample-chargeback",
    title: "Refund stalled after return delivery confirmation",
    caseType: "chargeback_refund",
    status: "ready",
    route: "Chargeback / refund",
    blurb:
      "An order receipt, return-policy screenshot, and support thread become a clean escalation packet.",
    summary:
      "A $384.16 order was returned and delivered on April 22, 2026. The merchant policy says refunds are issued within 5 to 7 business days after delivery, but support has not confirmed the refund.",
    artifacts: [
      {
        id: "artifact-chargeback-receipt",
        kind: "text",
        fileName: "order-receipt.txt",
        mimeType: "text/plain",
        localPath: "/samples/chargeback/order-receipt.txt",
        extractedText:
          "Northstar Goods order receipt. Order NSG-88341 placed April 11, 2026 by Priya Shah. Trail pack and jacket bundle total $384.16 paid Mastercard ending 1120. Shipping address Chicago IL.",
      },
      {
        id: "artifact-chargeback-policy",
        kind: "screenshot",
        fileName: "return-policy-screenshot.svg",
        mimeType: "image/svg+xml",
        localPath: "/samples/chargeback/return-policy-screenshot.svg",
        extractedText:
          "Return policy screenshot captured April 12, 2026: Returns accepted within 30 days if unused. Refunds are issued to original payment method within 5 to 7 business days after the return package is delivered to our warehouse.",
      },
      {
        id: "artifact-chargeback-thread",
        kind: "email",
        fileName: "support-thread-excerpt.txt",
        mimeType: "text/plain",
        localPath: "/samples/chargeback/support-thread-excerpt.txt",
        extractedText:
          "Support thread April 23 to May 2, 2026. Customer provided tracking 1Z99003 delivered April 22 at 9:42 AM. Support replied April 25: We see the return in queue. May 2 customer follow-up: I still do not see refund or confirmation.",
      },
    ],
    facts: [
      {
        id: "fact-chargeback-party-merchant",
        category: "parties",
        key: "Merchant",
        value: "Northstar Goods",
        confidence: 0.96,
        sourceArtifactId: "artifact-chargeback-receipt",
        editable: true,
      },
      {
        id: "fact-chargeback-party-customer",
        category: "parties",
        key: "Customer",
        value: "Priya Shah",
        confidence: 0.94,
        sourceArtifactId: "artifact-chargeback-receipt",
        editable: true,
      },
      {
        id: "fact-chargeback-amount",
        category: "amounts",
        key: "Order total",
        value: "$384.16",
        confidence: 0.98,
        sourceArtifactId: "artifact-chargeback-receipt",
        editable: true,
      },
      {
        id: "fact-chargeback-date-delivered",
        category: "dates",
        key: "Return delivered",
        value: "April 22, 2026 at 9:42 AM",
        confidence: 0.88,
        sourceArtifactId: "artifact-chargeback-thread",
        editable: true,
      },
      {
        id: "fact-chargeback-promise",
        category: "promises",
        key: "Refund timing policy",
        value:
          "Refunds issued within 5 to 7 business days after return delivery.",
        confidence: 0.9,
        sourceArtifactId: "artifact-chargeback-policy",
        editable: true,
      },
      {
        id: "fact-chargeback-deadline",
        category: "deadlines",
        key: "Escalate if no refund by",
        value: "May 5, 2026",
        confidence: 0.8,
        sourceArtifactId: "artifact-chargeback-policy",
        editable: true,
      },
      {
        id: "fact-chargeback-evidence",
        category: "evidence",
        key: "Tracking number",
        value: "1Z99003 delivered April 22",
        confidence: 0.86,
        sourceArtifactId: "artifact-chargeback-thread",
        editable: true,
      },
    ],
    timeline: [
      {
        id: "timeline-chargeback-order",
        label: "Order NSG-88341 placed",
        eventDate: "2026-04-11T16:30:00.000Z",
        sourceArtifactId: "artifact-chargeback-receipt",
      },
      {
        id: "timeline-chargeback-delivered",
        label: "Return package delivered",
        eventDate: "2026-04-22T14:42:00.000Z",
        sourceArtifactId: "artifact-chargeback-thread",
      },
      {
        id: "timeline-chargeback-followup",
        label: "Customer followed up with support",
        eventDate: "2026-05-02T20:10:00.000Z",
        sourceArtifactId: "artifact-chargeback-thread",
      },
    ],
    actions: [
      {
        id: "action-chargeback-final",
        title: "Send final refund-status request with policy and tracking",
        description:
          "Ask the merchant to confirm refund timing and include order number, tracking, policy screenshot, and amount.",
        priority: "high",
        dueDate: "2026-05-05T18:00:00.000Z",
        status: "todo",
        rationale:
          "The policy window has likely passed based on return delivery on April 22.",
      },
      {
        id: "action-chargeback-bank",
        title: "Prepare card issuer packet if merchant does not respond",
        description:
          "Create a packet with receipt, return policy, delivery tracking, and support thread.",
        priority: "medium",
        dueDate: "2026-05-08T18:00:00.000Z",
        status: "todo",
        rationale:
          "A complete packet supports a clearer chargeback conversation if needed.",
      },
      {
        id: "action-chargeback-log",
        title: "Log every support touchpoint",
        description:
          "Record dates, channel, representative names, and exact promises in the timeline.",
        priority: "low",
        dueDate: null,
        status: "todo",
        rationale:
          "A support log reduces ambiguity if the issue escalates.",
      },
    ],
    drafts: [
      {
        id: "draft-chargeback-email",
        channel: "email",
        title: "Refund escalation email",
        body:
          "Hello Northstar Goods Support,\n\nI am following up on order NSG-88341 for $384.16. My return package, tracking 1Z99003, was delivered to your warehouse on April 22, 2026 at 9:42 AM. Your return policy states that refunds are issued to the original payment method within 5 to 7 business days after delivery.\n\nPlease confirm the refund status, expected posting date, and whether any additional information is needed from me.\n\nThank you,\nPriya Shah",
      },
      {
        id: "draft-chargeback-support",
        channel: "support_chat",
        title: "Support chat escalation",
        body:
          "Hi, I need a refund status update for order NSG-88341. Return tracking 1Z99003 shows delivered April 22 at 9:42 AM, and your policy says refunds post within 5 to 7 business days after delivery. Can you confirm the refund date or escalate this to billing?",
      },
    ],
  },
];

export function findSampleCase(caseId: string) {
  return sampleCases.find((sample) => sample.id === caseId);
}
