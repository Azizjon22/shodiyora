import { ChefHat, UserRound, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { WorkerPosition } from "@shodiyora/shared";

export const POSITION_ICON: Record<WorkerPosition, ReactNode> = {
  WAITER_MALE: <UserRound className="h-5 w-5" />,
  WAITER_FEMALE: <UserRound className="h-5 w-5" />,
  CHEF: <ChefHat className="h-5 w-5" />,
  OTHER: <Users className="h-5 w-5" />,
};

export const POSITION_TONE: Record<WorkerPosition, string> = {
  WAITER_MALE: "bg-primary/10 text-primary",
  WAITER_FEMALE: "bg-accent/15 text-accent",
  CHEF: "bg-success/15 text-success",
  OTHER: "bg-muted text-foreground",
};

export const STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "destructive" }> = {
  PENDING: { label: "Kutilmoqda", variant: "default" },
  APPROVED: { label: "Tasdiqlangan", variant: "success" },
  REJECTED: { label: "Rad etilgan", variant: "destructive" },
};
