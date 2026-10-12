"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginTelegramAction } from "@/lib/actions/auth.actions";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

const SDK_SRC = "https://telegram.org/js/telegram-web-app.js";

function loadTelegramSdk(): Promise<void> {
  if (window.Telegram?.WebApp) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Where the bot's Mini App buttons land. Signs the visitor in with
 * Telegram's own initData (no password/PIN) and sends them on to the real
 * page — only reachable if their chat was already linked via /start.
 */
export default function TelegramEntryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      await loadTelegramSdk();
      const tg = window.Telegram?.WebApp;
      tg?.ready?.();
      tg?.expand?.();

      const initData = tg?.initData;
      if (!initData) {
        setError("Bu sahifa faqat Telegram bot ichida ochiladi.");
        return;
      }

      const result = await loginTelegramAction(initData);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") ? next : result.next);
    }

    void run();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      {error ? (
        <p className="max-w-xs text-sm text-destructive">{error}</p>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Kirilmoqda...</p>
        </>
      )}
    </div>
  );
}
