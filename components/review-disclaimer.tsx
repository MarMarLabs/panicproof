import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { reviewDisclaimer } from "@/lib/sample-data";

export function ReviewDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <Alert className="border-teal-200 bg-teal-50/80 text-teal-950">
      <AlertCircleIcon />
      {!compact && <AlertTitle>Human review required</AlertTitle>}
      <AlertDescription className={compact ? "text-xs" : undefined}>
        {reviewDisclaimer}
      </AlertDescription>
    </Alert>
  );
}
