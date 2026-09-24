import { apiFetch } from "@/lib/api";
import type { StaffUserSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateStaffForm } from "@/components/staff/create-staff-form";
import { StaffActions } from "@/components/staff/staff-actions";
import { getLocale } from "@/i18n/locale";
import { getDictionary, translate } from "@/i18n/get-dictionary";

export default async function StaffPage() {
  const [staff, locale] = await Promise.all([apiFetch<StaffUserSummary[]>("/staff-users"), getLocale()]);
  const dict = getDictionary(locale);
  const t = (key: string) => translate(dict, key);

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
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.fullName}</p>
                <p className="text-xs text-muted-foreground">{s.phone}</p>
              </div>
              <Badge variant="primary">{t(`roles.${s.role}`)}</Badge>
              <Badge variant={s.isActive ? "success" : "destructive"}>
                {s.isActive ? t("staffExtra.active") : t("staffExtra.inactive")}
              </Badge>
              <StaffActions staffId={s.id} isActive={s.isActive} />
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
    </div>
  );
}
