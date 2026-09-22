"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { MENU_MEDIA_SECTIONS, MENU_MEDIA_SECTION_LABELS_UZ } from "@shodiyora/shared";
import { addMediaAction, type FormActionState } from "@/lib/actions/menus.actions";
import { Label, Select, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadField } from "@/components/uploads/upload-field";

const initialState: FormActionState = undefined;

export function AddMediaForm({ menuId }: { menuId: string }) {
  const action = addMediaAction.bind(null, menuId);
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [mediaType, setMediaType] = useState<"PHOTO" | "VIDEO">("PHOTO");

  useEffect(() => {
    if (!state?.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="section">Bo&apos;lim</Label>
        <Select id="section" name="section" required>
          {MENU_MEDIA_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {MENU_MEDIA_SECTION_LABELS_UZ[s]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="mediaType">Turi</Label>
        <Select
          id="mediaType"
          name="mediaType"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as "PHOTO" | "VIDEO")}
        >
          <option value="PHOTO">Rasm</option>
          <option value="VIDEO">Video</option>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <UploadField
          key={mediaType}
          name="url"
          label={mediaType === "PHOTO" ? "Rasm" : "Video"}
          kind={mediaType === "PHOTO" ? "image" : "video"}
          folder="menus"
          accept={mediaType === "PHOTO" ? "image/jpeg,image/png,image/webp" : "video/mp4"}
          required
        />
      </div>
      <FieldError>{state?.error}</FieldError>
      <SubmitButton pendingText="Qo'shilmoqda..." variant="outline" className="sm:w-fit">
        Qo&apos;shish
      </SubmitButton>
    </form>
  );
}
