import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail, WorkerSummary } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { WorkersBrowser } from "@/components/workers/workers-browser";
import { WorkersPageHeader } from "@/components/workers/workers-page-header";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default async function WorkersPage() {
  const [workers, allEvents, session] = await Promise.all([
    apiFetch<WorkerSummary[]>("/workers"),
    apiFetch<EventDetail[]>("/events"),
    getSession(),
  ]);

  const role = session?.user.kind === "STAFF" ? session.user.role : "ADMIN";

  const today = startOfDay(new Date());
  const upcomingEvents = allEvents.filter(
    (e) => e.status !== "CANCELLED" && startOfDay(new Date(e.eventDate)) >= today,
  );
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
