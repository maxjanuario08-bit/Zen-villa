"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

type Props = {
  slug: string;
  maxGuests: number;
  stays: readonly PaidStay[];
  cleanings: readonly CleaningRecord[];
};

export default function OwnerOps({ slug, maxGuests, stays, cleanings }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const stampFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  function formatDay(iso: string) {
    return dateFmt.format(new Date(`${iso}T12:00:00`));
  }

  async function refresh() {
    router.refresh();
  }

  async function compressFile(file: File): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("image"));
        image.src = url;
      });
      const max = 1280;
      let width = img.width;
      let height = img.height;
      if (width > max || height > max) {
        const ratio = Math.min(max / width, max / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL("image/jpeg", 0.72);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function uploadPhotos(stayId: string, kind: "in" | "out", files: FileList | null) {
    if (!files?.length) return;
    setBusy(`photos:${stayId}:${kind}`);
    setError(null);
    try {
      const photos: string[] = [];
      for (const file of Array.from(files).slice(0, 6)) {
        photos.push(await compressFile(file));
      }
      const res = await fetch("/api/owner/stays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stayId,
          action: kind === "in" ? "photos-in" : "photos-out",
          photos,
        }),
      });
      if (!res.ok) {
        setError(t("opsError"));
        return;
      }
      await refresh();
    } catch {
      setError(t("opsError"));
    } finally {
      setBusy(null);
    }
  }

  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy("book");
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          guestLabel: String(data.get("guestLabel") ?? ""),
          checkIn: String(data.get("checkIn") ?? ""),
          checkOut: String(data.get("checkOut") ?? ""),
          guests: Number(data.get("guests") || 1),
        }),
      });
      if (res.status === 409) {
        setError(t("bookOverlap"));
        return;
      }
      if (!res.ok) {
        setError(t("bookError"));
        return;
      }
      form.reset();
      await refresh();
    } catch {
      setError(t("bookError"));
    } finally {
      setBusy(null);
    }
  }

  async function patchStay(stayId: string, action: "checkin" | "checkout" | "delete") {
    setBusy(`${action}:${stayId}`);
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stayId, action }),
      });
      if (!res.ok) {
        setError(t("opsError"));
        return;
      }
      await refresh();
    } catch {
      setError(t("opsError"));
    } finally {
      setBusy(null);
    }
  }

  async function addCleaning(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy("clean");
    setError(null);
    try {
      const res = await fetch("/api/owner/cleanings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stayId: String(data.get("stayId") ?? ""),
          date: String(data.get("date") ?? ""),
          time: String(data.get("time") ?? "10:00"),
          cleanerName: String(data.get("cleanerName") ?? ""),
          notes: String(data.get("notes") ?? ""),
        }),
      });
      if (!res.ok) {
        setError(t("cleanError"));
        return;
      }
      form.reset();
      await refresh();
    } catch {
      setError(t("cleanError"));
    } finally {
      setBusy(null);
    }
  }

  async function markCleaned(stay: PaidStay) {
    setBusy(`cleanstay:${stay.id}`);
    setError(null);
    try {
      const res = await fetch("/api/owner/cleanings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stayId: stay.id,
          date: stay.checkOut,
          time: "10:00",
          cleanerName: "",
          notes: "",
        }),
      });
      if (!res.ok) {
        setError(t("cleanError"));
        return;
      }
      await refresh();
    } catch {
      setError(t("cleanError"));
    } finally {
      setBusy(null);
    }
  }

  const ordered = [...stays].sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("bookTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("bookLead")}</p>
        <form onSubmit={(e) => void book(e)} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="guestLabel" className="mb-1 block text-sm font-medium">
              {t("bookGuest")}
            </label>
            <input
              id="guestLabel"
              name="guestLabel"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="checkIn" className="mb-1 block text-sm font-medium">
              {t("bookIn")}
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="checkOut" className="mb-1 block text-sm font-medium">
              {t("bookOut")}
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="guests" className="mb-1 block text-sm font-medium">
              {t("bookGuests")}
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={maxGuests}
              defaultValue={2}
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" className="w-full" disabled={busy === "book"}>
              {busy === "book" ? t("bookSaving") : t("bookSubmit")}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("staysTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("staysLead")}</p>
        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("staysEmpty")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-sand/40">
            {ordered.map((stay) => {
              const cleaned = cleanings.some((row) => row.stayId === stay.id);
              return (
                <li key={stay.id} className="py-4 first:pt-0">
                  <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
                  <p className="text-sm text-foreground/70">
                    {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)} · {t("bookGuestsCount", { count: stay.guests })}
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {stay.checkedInAt
                      ? t("checkedInAt", { when: stampFmt.format(new Date(stay.checkedInAt)) })
                      : t("checkInPending")}
                    {" · "}
                    {stay.checkedOutAt
                      ? t("checkedOutAt", { when: stampFmt.format(new Date(stay.checkedOutAt)) })
                      : t("checkOutPending")}
                    {" · "}
                    {cleaned ? t("cleanedYes") : t("cleanedNo")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!stay.checkedInAt ? (
                      <button
                        type="button"
                        disabled={busy === `checkin:${stay.id}`}
                        onClick={() => void patchStay(stay.id, "checkin")}
                        className="rounded-full bg-lagoon px-4 py-1.5 text-sm font-medium text-white hover:bg-lagoon-dark disabled:opacity-60"
                      >
                        {t("markCheckIn")}
                      </button>
                    ) : null}
                    {!stay.checkedOutAt ? (
                      <button
                        type="button"
                        disabled={busy === `checkout:${stay.id}`}
                        onClick={() => void patchStay(stay.id, "checkout")}
                        className="rounded-full border border-lagoon px-4 py-1.5 text-sm font-medium text-lagoon hover:bg-lagoon hover:text-white disabled:opacity-60"
                      >
                        {t("markCheckOut")}
                      </button>
                    ) : null}
                    {stay.checkedOutAt && !cleaned ? (
                      <button
                        type="button"
                        disabled={busy === `cleanstay:${stay.id}`}
                        onClick={() => void markCleaned(stay)}
                        className="rounded-full bg-sand-dark px-4 py-1.5 text-sm font-medium text-foreground hover:bg-sand disabled:opacity-60"
                      >
                        {t("markCleaned")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy === `delete:${stay.id}`}
                      onClick={() => void patchStay(stay.id, "delete")}
                      className="rounded-full px-4 py-1.5 text-sm text-foreground/55 hover:text-red-700"
                    >
                      {t("stayDelete")}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">{t("photosInTitle")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(stay.checkInPhotos ?? []).map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={`in-${stay.id}-${i}`}
                            src={src}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                      <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-lagoon">
                        {t("addPhotos")}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            void uploadPhotos(stay.id, "in", e.target.files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">{t("photosOutTitle")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(stay.checkOutPhotos ?? []).map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={`out-${stay.id}-${i}`}
                            src={src}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                      <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-lagoon">
                        {t("addPhotos")}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            void uploadPhotos(stay.id, "out", e.target.files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("cleaningTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("cleaningLead")}</p>
        <form onSubmit={(e) => void addCleaning(e)} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="clean-date" className="mb-1 block text-sm font-medium">
              {t("cleanDate")}
            </label>
            <input
              id="clean-date"
              name="date"
              type="date"
              required
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="clean-time" className="mb-1 block text-sm font-medium">
              {t("cleanTime")}
            </label>
            <input
              id="clean-time"
              name="time"
              type="time"
              defaultValue="10:00"
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="cleanerName" className="mb-1 block text-sm font-medium">
              {t("cleanBy")}
            </label>
            <input
              id="cleanerName"
              name="cleanerName"
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <label htmlFor="clean-stay" className="mb-1 block text-sm font-medium">
              {t("cleanStay")}
            </label>
            <select
              id="clean-stay"
              name="stayId"
              className="w-full rounded-xl border border-sand/60 bg-white px-4 py-2.5 outline-none focus:border-lagoon"
            >
              <option value="">{t("cleanStayNone")}</option>
              {ordered.map((stay) => (
                <option key={stay.id} value={stay.id}>
                  {stayName(stay, t)} · {formatDay(stay.checkOut)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="clean-notes" className="mb-1 block text-sm font-medium">
              {t("cleanNotes")}
            </label>
            <textarea
              id="clean-notes"
              name="notes"
              rows={3}
              className="w-full rounded-xl border border-sand/60 px-4 py-2.5 outline-none focus:border-lagoon"
            />
          </div>
          <div>
            <Button type="submit" variant="primary" disabled={busy === "clean"}>
              {busy === "clean" ? t("cleanSaving") : t("cleanSubmit")}
            </Button>
          </div>
        </form>

        {cleanings.length === 0 ? (
          <p className="mt-5 text-sm text-muted">{t("cleaningEmpty")}</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {[...cleanings]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((row) => (
                <li key={row.id} className="border-t border-sand/40 pt-4">
                  <p className="text-sm font-medium text-lagoon-dark">
                    {formatDay(row.date)} · {row.time}
                  </p>
                  {row.cleanerId ? (
                    <p className="mt-1 text-sm text-foreground/80">{t("cleaningBy", { name: row.cleanerId })}</p>
                  ) : null}
                  {row.notes ? <p className="mt-2 text-sm text-foreground/85">{row.notes}</p> : null}
                </li>
              ))}
          </ul>
        )}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
