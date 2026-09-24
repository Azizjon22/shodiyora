import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { StaffUserSummary, WorkerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STAFF_ROLE_LABELS_UZ, WORKER_GENDER_LABELS_UZ } from "@shodiyora/shared";
import { CreateStaffForm } from "@/components/staff/create-staff-form";
import { StaffActions } from "@/components/staff/staff-actions";
import { CreateChefForm } from "@/components/staff/create-chef-form";
import { WorkerActions } from "@/components/workers/worker-actions";
import { formatDate } from "@/lib/utils";

const WORKER_STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "destructive" }> = {
  PENDING: { label: "Kutilmoqda", variant: "default" },
  APPROVED: { label: "Tasdiqlangan", variant: "success" },
  REJECTED: { label: "Rad etilgan", variant: "destructive" },
};

export default async function StaffPage() {
  const [staff, chefs, session] = await Promise.all([
    apiFetch<StaffUserSummary[]>("/staff-users"),
    apiFetch<WorkerSummary[]>("/workers?position=CHEF"),
    getSession(),
  ]);
  const role = session?.user.kind === "STAFF" ? session.user.role : "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Xodimlar</h1>
        <p className="text-sm text-muted-foreground">Admin va zavzal hisoblarini boshqarish</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hisoblar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.fullName}</p>
                <p className="text-xs text-muted-foreground">{s.phone}</p>
              </div>
              <Badge variant="primary">{STAFF_ROLE_LABELS_UZ[s.role]}</Badge>
              <Badge variant={s.isActive ? "success" : "destructive"}>{s.isActive ? "Faol" : "Faol emas"}</Badge>
              <StaffActions staffId={s.id} isActive={s.isActive} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yangi hisob yaratish</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateStaffForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Oshpazlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Har bir oshpaz Malika opa bilan bir xil huquqqa ega bo&apos;ladi — to&apos;ylarni ko&apos;rish va
            bozorlik ro&apos;yxati yozish.
          </p>
          <div className="space-y-2">
            {chefs.length === 0 && <p className="text-sm text-muted-foreground">Hali oshpaz qo&apos;shilmagan.</p>}
            {chefs.map((chef) => {
              const status = WORKER_STATUS_BADGE[chef.status];
              return (
                <div key={chef.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3">
                  {chef.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chef.photoUrl} alt={chef.fullName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-sm font-semibold text-success">
                      {chef.fullName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-40 flex-1">
                    <p className="text-sm font-medium">{chef.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {chef.phone} · {chef.gender ? WORKER_GENDER_LABELS_UZ[chef.gender] : "—"} ·{" "}
                      {formatDate(chef.createdAt)}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <WorkerActions workerId={chef.id} status={chef.status} role={role} position={chef.position} />
                </div>
              );
            })}
          </div>
          <CreateChefForm />
        </CardContent>
      </Card>
    </div>
  );
}
