import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { BrandProvider } from "@/components/brand/brand-provider";
import { getBrand } from "@/lib/brand";
import { DEFAULT_LOGO_URL } from "@/lib/brand-shared";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/types";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { brandName, logoUrl } = await getBrand();
  return {
    title: `${brandName} | To'yxona boshqaruv tizimi`,
    description: `${brandName} to'yxonasi uchun admin panel: to'y buyurtmalari, menyular, ombor va ishchilar.`,
    manifest: "/manifest.webmanifest",
    icons: { icon: logoUrl ?? DEFAULT_LOGO_URL, apple: logoUrl ?? DEFAULT_LOGO_URL },
  };
}

export const viewport: Viewport = {
  themeColor: "#7a1f3d",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  const locale: Locale = raw === "ru" ? "ru" : "uz";
  const brand = await getBrand();
  // The configured brand name replaces the built-in one everywhere t("common.brand") is used.
  const base = getDictionary(locale);
  const dictionary = { ...base, common: { ...base.common, brand: brand.brandName } };

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BrandProvider brand={brand}>
          <LocaleProvider locale={locale} dictionary={dictionary}>
            {children}
          </LocaleProvider>
        </BrandProvider>
        {/* Must run before hydration paints, or the page flashes the wrong
            theme for a frame. Per next/script's own API reference, a
            beforeInteractive Script belongs inside <body> after {children}
            — Next hoists it into the built HTML's <head> regardless; both
            <head> and a bare <html> child are Next 16 rendering no-ops. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
          }}
        />
      </body>
    </html>
  );
}
