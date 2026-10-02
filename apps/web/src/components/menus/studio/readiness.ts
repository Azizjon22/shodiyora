import type { Menu } from "@/lib/types";
import type { TranslationKey } from "@/i18n/get-dictionary";

type T = (key: TranslationKey | string, params?: Record<string, string | number>) => string;

export interface ReadinessCheck {
  key: string;
  label: string;
  /** 0..1 — partial credit, e.g. 9 of 13 dishes have a photo. */
  score: number;
  weight: number;
  hint?: string;
  tab?: "dishes" | "gallery" | "info";
}

// The courses a client expects to see on any wedding menu.
const CORE_CATEGORIES = ["SALAD", "FIRST_DISH", "SECOND_DISH", "DESSERT", "DRINK"] as const;

/**
 * How presentable a menu is to a client, with what's still missing — drives
 * the readiness ring on the list and the checklist in the editor.
 */
export function menuReadiness(menu: Menu, broken: Set<string>, t: T) {
  const dishes = menu.dishes;
  const photos = menu.media.filter((m) => m.mediaType === "PHOTO");
  const coverOk = !!menu.coverImageUrl && !broken.has(menu.coverImageUrl);

  const withPhoto = dishes.filter((d) => d.photoUrl && !broken.has(d.photoUrl));
  const uniquePhotos = new Set(withPhoto.map((d) => d.photoUrl)).size;
  // Placeholder stock photos reused across many dishes don't count twice.
  const photoScore = dishes.length === 0 ? 0 : Math.min(withPhoto.length, uniquePhotos) / dishes.length;
  const sharedPhotoDishes = withPhoto.length - uniquePhotos;

  const missingCourses: string[] = CORE_CATEGORIES.filter((c) => !dishes.some((d) => d.category === c));
  const allUrls = [menu.coverImageUrl, ...dishes.map((d) => d.photoUrl), ...menu.media.map((m) => m.url)].filter(
    (u): u is string => !!u,
  );
  const brokenCount = allUrls.filter((u) => broken.has(u)).length;

  const checks: ReadinessCheck[] = [
    {
      key: "cover",
      label: t("menuStudio.readinessCover"),
      score: coverOk ? 1 : 0,
      weight: 20,
      hint: !menu.coverImageUrl
        ? t("menuStudio.readinessCoverMissing")
        : !coverOk
          ? t("menuStudio.readinessCoverBroken")
          : undefined,
      tab: "info",
    },
    {
      key: "description",
      label: t("menuStudio.readinessDescription"),
      score: (menu.description?.trim().length ?? 0) >= 20 ? 1 : menu.description?.trim() ? 0.5 : 0,
      weight: 10,
      hint: !menu.description?.trim() ? t("menuStudio.readinessDescriptionHint") : undefined,
      tab: "info",
    },
    {
      key: "courses",
      label: t("menuStudio.readinessCourses"),
      score: (CORE_CATEGORIES.length - missingCourses.length) / CORE_CATEGORIES.length,
      weight: 20,
      hint: missingCourses.length
        ? t("menuStudio.readinessCoursesHint", { count: missingCourses.length })
        : undefined,
      tab: "dishes",
    },
    {
      key: "dishPhotos",
      label: t("menuStudio.readinessDishPhotos"),
      score: photoScore,
      weight: 25,
      hint:
        dishes.length - withPhoto.length > 0
          ? t("menuStudio.readinessDishPhotosMissing", { count: dishes.length - withPhoto.length })
          : sharedPhotoDishes > 0
            ? t("menuStudio.readinessDishPhotosShared", { count: sharedPhotoDishes + 1 })
            : undefined,
      tab: "dishes",
    },
    {
      key: "gallery",
      label: t("menuStudio.readinessGallery"),
      score: Math.min(1, photos.filter((p) => !broken.has(p.url)).length / 4),
      weight: 15,
      hint: photos.length < 4 ? t("menuStudio.readinessGalleryHint", { count: 4 - photos.length }) : undefined,
      tab: "gallery",
    },
    {
      key: "broken",
      label: t("menuStudio.readinessBroken"),
      score: allUrls.length === 0 ? 1 : 1 - brokenCount / allUrls.length,
      weight: 10,
      hint: brokenCount ? t("menuStudio.readinessBrokenHint", { count: brokenCount }) : undefined,
    },
  ];

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const percent = Math.round((checks.reduce((s, c) => s + c.score * c.weight, 0) / total) * 100);
  return { percent, checks, missingCourses, brokenCount };
}

export function allMenuImageUrls(menu: Menu) {
  return [
    menu.coverImageUrl,
    ...menu.dishes.map((d) => d.photoUrl),
    ...menu.media.filter((m) => m.mediaType === "PHOTO").map((m) => m.url),
  ].filter((u): u is string => !!u);
}
