import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { StaffUserSummary, WorkerSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateStaffForm } from "@/components/staff/create-staff-form";
import { StaffActions } from "@/components/staff/staff-actions";
import { CreateChefForm } from "@/components/staff/create-chef-form";
import { WorkerActions } from "@/components/workers/worker-actions";
import { formatDate } from "@/lib/utils";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

const WORKER_STATUS_VARIANT: Record<string, "default" | "success" | "destructive"> = {
  PENDING: "default",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default async function StaffPage() {
  const [staff, chefs, session, locale] = await Promise.all([
    apiFetch<StaffUserSummary[]>("/staff-users"),
    apiFetch<WorkerSummary[]>("/workers?position=CHEF"),
    getSession(),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);
  const role = session?.user.kind === "STAFF" ? session.user.role : "ADMIN";

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("staff.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("staff.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("staff.accounts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
              <div className="min-w-[140px] flex-1">
                <p className="text-sm font-medium">{s.fullName}</p>
                <p className="text-xs text-muted-foreground">{s.phone}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{t(`roles.${s.role}`)}</Badge>
                <Badge variant={s.isActive ? "success" : "destructive"}>
                  {s.isActive ? t("staffExtra.active") : t("staffExtra.inactive")}
                </Badge>
                <StaffActions staffId={s.id} isActive={s.isActive} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("staff.createAccount")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateStaffForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("staffExtra.chefsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">{t("staffExtra.chefsDescription")}</p>
          <div className="space-y-2">
            {chefs.length === 0 && <p className="text-sm text-muted-foreground">{t("staffExtra.chefsEmpty")}</p>}
            {chefs.map((chef) => (
              <div key={chef.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
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
                    {chef.phone} · {chef.gender ? t(`workerGenders.${chef.gender}`) : "—"} ·{" "}
                    {formatDate(chef.createdAt, locale)}
                  </p>
                </div>
                <Badge variant={WORKER_STATUS_VARIANT[chef.status]}>{t(`workerStatus.${chef.status}`)}</Badge>
                <WorkerActions workerId={chef.id} status={chef.status} role={role} position={chef.position} />
              </div>
            ))}
          </div>
          <CreateChefForm />
        </CardContent>
      </Card>
    </div>
  );
}
