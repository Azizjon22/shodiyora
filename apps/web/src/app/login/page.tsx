import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          S
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Shodiyora</h1>
        <p className="mt-1 text-sm text-muted-foreground">To&apos;yxona boshqaruv tizimiga xush kelibsiz</p>
      </div>
      <LoginForm />
    </main>
  );
}
