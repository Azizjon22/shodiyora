import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth.actions";
import { LogOut } from "lucide-react";

export default async function WorkerLayout({ children }: LayoutProps<"/worker">) {
  const session = await getSession();
  if (!session || session.user.kind !== "WORKER") {
    redirect("/login");
  }
  if (session.user.mustChangePin) {
    redirect("/change-pin");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <span className="text-lg font-semibold text-primary">Shodiyora</span>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{session.user.fullName}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Chiqish"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-lg p-4 sm:p-6">{children}</main>
    </div>
  );
}
