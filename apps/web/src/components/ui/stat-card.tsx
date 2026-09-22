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
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
