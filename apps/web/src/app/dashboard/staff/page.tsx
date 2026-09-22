import { apiFetch } from "@/lib/api";
import type { StaffUserSummary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STAFF_ROLE_LABELS_UZ } from "@shodiyora/shared";
import { CreateStaffForm } from "@/components/staff/create-staff-form";
import { StaffActions } from "@/components/staff/staff-actions";

export default async function StaffPage() {
  const staff = await apiFetch<StaffUserSummary[]>("/staff-users");

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
    </div>
  );
}
