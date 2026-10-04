"use client";

import { useState } from "react";
import { MENU_MEDIA_SECTIONS, type MenuMediaSection } from "@shodiyora/shared";
import type { MenuMedia } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { UploadField } from "@/components/uploads/upload-field";
import { useT } from "@/components/i18n/locale-provider";
import { menuApi, errorText } from "./api";

function mediaKind(url: string): "PHOTO" | "VIDEO" {
  return /\.(?:mp4|mov)(?:$|\?)/i.test(url) ? "VIDEO" : "PHOTO";
}

export function MediaModal({
  open,
  onClose,
  onSaved,
  menuId,
  item,
  section,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  menuId: string;
  item?: MenuMedia;
  section?: MenuMediaSection;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const url = String(form.get("url") ?? "");
    if (!url) return setError(t("menuStudio.mediaRequired"));
    const body = {
      section: form.get("section"),
      mediaType: mediaKind(url),
      url,
      caption: String(form.get("caption") ?? "").trim(),
    };

    setBusy(true);
    setError(undefined);
    try {
      if (item) await menuApi(`/${menuId}/media/${item.id}`, "PATCH", body);
      else await menuApi(`/${menuId}/media`, "POST", body);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err, t("common.genericError")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? t("menuStudio.editMedia") : t("menuStudio.addMedia")}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="media-form" disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form id="media-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <UploadField
            name="url"
            label={t("menuStudio.photoOrVideo")}
            folder="menus"
            kind={item?.mediaType === "VIDEO" ? "video" : "image"}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.mov"
            browse
            formats="JPG, PNG, WebP, MP4, MOV"
            minWidth={1280}
            minHeight={720}
            defaultValue={item?.url}
          />
          <p className="mt-2 text-xs text-muted-foreground">{t("menuStudio.videoSilentHint")}</p>
        </div>
        <div>
          <Label htmlFor="media-section">{t("menuStudio.section")}</Label>
          <Select id="media-section" name="section" defaultValue={item?.section ?? section ?? "HALL"}>
            {MENU_MEDIA_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`mediaSections.${s}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="media-caption">{t("menuStudio.caption")}</Label>
          <Input
            id="media-caption"
            name="caption"
            defaultValue={item?.caption ?? ""}
            placeholder={t("menuStudio.captionPlaceholder")}
          />
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}
