import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail, WorkerSummary } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { CreateWorkerModal } from "@/components/workers/create-worker-modal";
import { WorkersBrowser } from "@/components/workers/workers-browser";

export default async function WorkersPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const windowEnd = new Date(startOfToday);
  windowEnd.setDate(windowEnd.getDate() + 30);

  const [workers, upcomingEvents, session] = await Promise.all([
    apiFetch<WorkerSummary[]>("/workers"),
    apiFetch<EventDetail[]>(`/events?from=${startOfToday.toISOString()}&to=${windowEnd.toISOString()}`),
    getSession(),
  ]);

  const role = session?.user.kind === "STAFF" ? session.user.role : "ADMIN";

  const staffingEvents = upcomingEvents.map((e) => ({
    id: e.id,
    clientName: e.clientName,
    eventDate: e.eventDate,
    assignedWorkerIds: e.assignments.map((a) => a.workerId),
  }));

  const approvedCount = workers.filter((w) => w.status === "APPROVED").length;
  const pendingCount = workers.filter((w) => w.status === "PENDING").length;
  const rejectedCount = workers.filter((w) => w.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ishchilar</h1>
          <p className="text-sm text-muted-foreground">Ro&apos;yxatdan o&apos;tgan afitsant va oshpazlar</p>
        </div>
        <CreateWorkerModal />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jami ishchilar" value={workers.length} icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label="Tasdiqlangan" value={approvedCount} icon={<UserCheck className="h-5 w-5" />} tone="accent" />
        <StatCard
          label="Kutilmoqda"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
          tone={pendingCount > 0 ? "destructive" : "default"}
        />
        <StatCard label="Rad etilgan" value={rejectedCount} icon={<UserX className="h-5 w-5" />} />
      </div>

      <WorkersBrowser workers={workers} role={role} events={staffingEvents} />
    </div>
  );
}
