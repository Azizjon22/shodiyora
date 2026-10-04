"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_LOGO_URL } from "@/lib/brand-shared";
import { useBrand } from "./brand-provider";

/**
 * The project's logo: the uploaded image when there is one, otherwise the
 * built-in Shodiyora emblem. Size comes from className.
 */
export function BrandMark({
  className,
  logoUrl,
  name,
}: {
  className?: string;
  /** Override for previews (e.g. the Profil page before saving). */
  logoUrl?: string | null;
  name?: string;
}) {
  const brand = useBrand();
  const custom = logoUrl === undefined ? brand.logoUrl : logoUrl;
  const label = name ?? brand.brandName;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={custom ?? DEFAULT_LOGO_URL}
      alt={label}
      className={cn(
        "block shrink-0 rounded-full bg-card",
        // The built-in emblem carries its own margin so its wide base stays
        // inside the circle; uploaded square logos fill it edge to edge.
        custom ? "object-cover" : "object-contain",
        className,
      )}
    />
  );
}
