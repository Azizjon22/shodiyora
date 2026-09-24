import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail, WorkerSummary } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { WorkersBrowser } from "@/components/workers/workers-browser";
import { WorkersPageHeader } from "@/components/workers/workers-page-header";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

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

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  return (
    <div className="space-y-6 animate-fade-up">
      <WorkersPageHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("workers.totalWorkers")} value={workers.length} icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("workerStatus.APPROVED")} value={approvedCount} icon={<UserCheck className="h-5 w-5" />} tone="accent" />
        <StatCard
          label={t("workerStatus.PENDING")}
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
          tone={pendingCount > 0 ? "destructive" : "default"}
        />
        <StatCard label={t("workerStatus.REJECTED")} value={rejectedCount} icon={<UserX className="h-5 w-5" />} />
      </div>

      <WorkersBrowser workers={workers} role={role} events={staffingEvents} />
    </div>
  );
}
