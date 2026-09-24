"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  WORKER_GENDERS,
  WORKER_GENDER_LABELS_UZ,
  WORKER_POSITIONS,
  WORKER_POSITION_LABELS_UZ,
  workerRegisterSchema,
} from "@shodiyora/shared";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/uploads/image-dropzone";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<(typeof WORKER_POSITIONS)[number]>("WAITER_MALE");
  const [gender, setGender] = useState<(typeof WORKER_GENDERS)[number]>("MALE");
  const [pin, setPin] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [localPreview, setLocalPreview] = useState<string | undefined>();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const needsPin = position === "CHEF";

  async function handlePhotoSelected(file: File) {
    setPhotoError(undefined);
    setLocalPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const presignRes = await fetch(`${API_URL}/uploads/worker-photo-presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error("Rasm yuklash uchun ruxsat olinmadi");
      const { uploadUrl, publicUrl } = (await presignRes.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Rasm yuklashda xatolik yuz berdi");
      setPhotoUrl(publicUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Rasm yuklashda xatolik yuz berdi");
      setLocalPreview(undefined);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const parsed = workerRegisterSchema.safeParse({
      fullName,
      phone,
      position,
      gender,
      pin: needsPin ? pin : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri");
      return;
    }

    if (photoUploading) {
      setError("Rasm hali yuklanmoqda, biroz kuting");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/workers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, photoUrl }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kutilmagan xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm rounded-lg border border-success/30 bg-success/10 p-6 text-center">
        <p className="font-medium text-success">Muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrator tasdiqlashini kuting. Hozir kirish sahifasiga yo&apos;naltirilasiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <Label htmlFor="fullName">Ism va familiya</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefon raqami</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998901234567"
          required
        />
      </div>
      <div>
        <Label htmlFor="position">Lavozim</Label>
        <Select
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value as typeof position)}
        >
          {WORKER_POSITIONS.map((p) => (
            <option key={p} value={p}>
              {WORKER_POSITION_LABELS_UZ[p]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="gender">Jinsi</Label>
        <Select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as typeof gender)}
        >
          {WORKER_GENDERS.map((g) => (
            <option key={g} value={g}>
              {WORKER_GENDER_LABELS_UZ[g]}
            </option>
          ))}
        </Select>
      </div>
      {needsPin && (
        <div>
          <Label htmlFor="pin">PIN kod (4 raqam) — tizimga kirish uchun</Label>
          <Input
            id="pin"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            required={needsPin}
          />
        </div>
      )}
      <ImageDropzone
        label="Rasm (ixtiyoriy)"
        accept="image/jpeg,image/png,image/webp"
        previewUrl={photoUrl || localPreview}
        uploading={photoUploading}
        error={photoError}
        onFileSelected={handlePhotoSelected}
        onClear={() => {
          setPhotoUrl("");
          setLocalPreview(undefined);
        }}
        aspect="square"
      />
      <FieldError>{error}</FieldError>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hisobingiz bormi?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Kirish
        </Link>
      </p>
    </form>
  );
}
