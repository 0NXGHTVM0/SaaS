import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const severityColor: Record<Severity, string> = {
  critical: "bg-red-500 text-red-100",
  high: "bg-orange-500 text-orange-100",
  medium: "bg-amber-400 text-amber-950",
  low: "bg-emerald-400 text-emerald-950",
};

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex items-center gap-2 capitalize">
      <span className={cn("h-2 w-2 rounded-full", severityColor[severity])} />
      {severity}
    </span>
  );
}
