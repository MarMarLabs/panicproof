import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-md border px-2 text-[11px] font-semibold uppercase tracking-wide",
        priority === "high" &&
          "border-red-200 bg-red-50 text-red-700",
        priority === "medium" &&
          "border-amber-200 bg-amber-50 text-amber-700",
        priority === "low" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      {priority}
    </Badge>
  );
}
