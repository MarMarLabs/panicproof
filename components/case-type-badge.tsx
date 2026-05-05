import { Badge } from "@/components/ui/badge";
import { formatCaseType } from "@/lib/format";

export function CaseTypeBadge({ caseType }: { caseType: string }) {
  return (
    <Badge className="h-7 rounded-md bg-teal-700 px-2.5 text-xs text-white hover:bg-teal-700">
      {formatCaseType(caseType)}
    </Badge>
  );
}
