import { describe, expect, it } from "vitest";
import { generateActionsFromFacts } from "@/lib/actions/generator";

describe("generateActionsFromFacts", () => {
  it("prioritizes deposit itemization", () => {
    const actions = generateActionsFromFacts("security_deposit", [
      {
        category: "amounts",
        key: "Proposed deduction",
        value: "$650",
      },
      {
        category: "promises",
        key: "Lease clause",
        value: "Ordinary wear is not a tenant charge.",
      },
    ]);

    expect(actions[0].priority).toBe("high");
    expect(actions[0].title).toMatch(/itemized/i);
  });

  it("creates travel reimbursement actions by default", () => {
    const actions = generateActionsFromFacts("flight_cancellation", [
      {
        category: "deadlines",
        key: "Submit by",
        value: "May 10, 2026",
      },
    ]);

    expect(actions).toHaveLength(3);
    expect(actions[0].title).toMatch(/reimbursement/i);
  });
});
