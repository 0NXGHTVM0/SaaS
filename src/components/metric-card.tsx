import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  footer,
  children,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  footer?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-cyan-300" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{subtext}</p>
        </div>
        {children}
        {footer ? <p className="text-xs text-cyan-300">{footer}</p> : null}
      </CardContent>
    </Card>
  );
}
