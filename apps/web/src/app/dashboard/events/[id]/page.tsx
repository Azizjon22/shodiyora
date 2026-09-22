import { Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { EventDetail } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { formatDateTime, formatSom } from "@/lib/utils";
import { WORKER_POSITION_LABELS_UZ, EVENT_EXPENSE_CATEGORY_LABELS_UZ } from "@shodiyora/shared";
import { StatusSelect } from "@/components/events/status-select";
import { UnassignButton } from "@/components/events/unassign-button";
import { PaymentForm } from "@/components/events/payment-form";
import { ExpenseForm } from "@/components/events/expense-form";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { removeExpenseAction } from "@/lib/actions/events.actions";

export default async function EventDetailPage({ params }: PageProps<"/dashboard/events/[id]">) {
  const { id } = await params;
  const [event, session] = await Promise.all([apiFetch<EventDetail>(`/events/${id}`), getSession()]);

  const role = session?.user.kind === "STAFF" ? session.user.role : undefined;
  const canSeeFinancials = !!role && role !== "ZAVZAL";
  const canEdit = role === "SUPER_ADMIN" || role === "ADMIN";
  const canDelete = role === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{event.clientName}</h1>
          <p className="text-sm text-muted-foreground">{event.clientPhone}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <LinkButton href={`/dashboard/events/${event.id}/edit`} variant="outline" size="sm">
              <Pencil className="h-4 w-4" /> Tahrirlash
            </LinkButton>
          )}
          {canDelete && <DeleteEventButton eventId={event.id} clientName={event.clientName} />}
          <StatusSelect eventId={event.id} status={event.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>To&apos;y ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Sana</p>
            <p className="font-medium">{formatDateTime(event.eventDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Menyu</p>
            <p className="font-medium">{event.menu.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mehmonlar soni</p>
            <p className="font-medium">{event.guestCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stol turi</p>
            <p className="font-medium">{event.tableCapacity} kishilik</p>
          </div>
          {canSeeFinancials && event.totalPrice && (
            <>
              <div>
                <p className="text-muted-foreground">Umumiy narx</p>
                <p className="font-medium text-primary">{formatSom(event.totalPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Qoldiq balans</p>
                <p className={`font-medium ${Number(event.balance) > 0 ? "text-destructive" : "text-success"}`}>
                  {formatSom(event.balance ?? "0")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Jami xarajat</p>
                <p className="font-medium">{formatSom(event.totalExpenses ?? "0")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sof foyda</p>
                <p className={`font-medium ${Number(event.netProfit) >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatSom(event.netProfit ?? "0")}
                </p>
              </div>
            </>
          )}
          {event.notes && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Izoh</p>
              <p className="font-medium">{event.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tayinlangan ishchilar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Ishchilarni belgilash uchun &quot;Ishchilar&quot; bo&apos;limidagi &quot;Ertangi kunga
            chiqadiganlar&quot; jadvalidan foydalaning.
          </p>
          <div className="flex flex-wrap gap-2">
            {event.assignments.length === 0 && (
              <p className="text-sm text-muted-foreground">Hali hech kim tayinlanmagan.</p>
            )}
            {event.assignments.map((a) => (
              <Badge key={a.id} variant="primary" className="gap-1">
                {a.worker.fullName} · {WORKER_POSITION_LABELS_UZ[a.worker.position]}
                <UnassignButton eventId={event.id} workerId={a.workerId} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {canSeeFinancials && (
        <Card>
          <CardHeader>
            <CardTitle>To&apos;lovlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(event.payments ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">To&apos;lovlar hali kiritilmagan.</p>
              )}
              {(event.payments ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{formatSom(p.amount)}</span>
                  <span className="text-muted-foreground">{formatDateTime(p.paymentDate)}</span>
                </div>
              ))}
            </div>
            <PaymentForm eventId={event.id} />
          </CardContent>
        </Card>
      )}

      {canSeeFinancials && (
        <Card>
          <CardHeader>
            <CardTitle>Xarajatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(event.expenses ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Xarajatlar hali kiritilmagan.</p>
              )}
              {(event.expenses ?? []).map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {EVENT_EXPENSE_CATEGORY_LABELS_UZ[x.category]}
                      {x.note && <span className="font-normal text-muted-foreground"> — {x.note}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(x.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-medium text-destructive">{formatSom(x.amount)}</span>
                    {canDelete && <DeleteIconButton action={removeExpenseAction.bind(null, event.id, x.id)} />}
                  </div>
                </div>
              ))}
            </div>
            <ExpenseForm eventId={event.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
