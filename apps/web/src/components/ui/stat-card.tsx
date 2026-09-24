import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "primary" | "accent" | "destructive";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-muted text-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(122,31,61,0.08)]">
      <CardContent className="relative flex items-center justify-between gap-4 p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--surface-glow),transparent_55%)]" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              toneClasses[tone],
            )}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
