import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail, WorkerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkerForm } from "@/components/workers/create-worker-form";
import { WorkersByPosition } from "@/components/workers/workers-by-position";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Ishchilar</h1>
        <p className="text-sm text-muted-foreground">Ro&apos;yxatdan o&apos;tgan afitsant va oshpazlar</p>
      </div>

      <WorkersByPosition workers={workers} role={role} events={staffingEvents} />

      <Card>
        <CardHeader>
          <CardTitle>Yangi ishchi qo&apos;shish</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWorkerForm />
        </CardContent>
      </Card>
    </div>
  );
}
