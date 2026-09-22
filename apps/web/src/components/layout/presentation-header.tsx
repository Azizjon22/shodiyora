import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PresentationHeader() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+998 90 000 00 00";

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/menyular" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            S
          </span>
          Shodiyora
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-medium text-foreground hover:text-primary">
            {phone}
          </a>
          <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Boshqaruv paneli
          </Link>
        </div>
      </div>
    </header>
  );
}
