import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail, WorkerSummary } from "@/lib/types";
import { WorkersByPosition } from "@/components/workers/workers-by-position";
import { WorkersPageHeader } from "@/components/workers/workers-page-header";

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

  return (
    <div className="space-y-6 animate-fade-up">
      <WorkersPageHeader />
      <WorkersByPosition workers={workers} role={role} events={staffingEvents} />
    </div>
  );
}
