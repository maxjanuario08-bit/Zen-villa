"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import TimeSelect from "@/components/owner/TimeSelect";
import { todayISO } from "@/lib/booking";
import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

function stayName(stay: PaidStay, t: ReturnType<typeof useTranslations>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
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

type Props = {
  slug: string;
  stays: readonly PaidStay[];
  cleanings: readonly CleaningRecord[];
  onChanged: () => void;
};

export default function StaffOps({ slug, stays, cleanings, onChanged }: Props) {
  const t = useTranslations("Compte");
  const locale = useLocale();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [byIn, setByIn] = useState<Record<string, string>>({});
  const [byOut, setByOut] = useState<Record<string, string>>({});
  const [timeIn, setTimeIn] = useState<Record<string, string>>({});
  const [timeOut, setTimeOut] = useState<Record<string, string>>({});
  const [cleanPhotos, setCleanPhotos] = useState<string[]>([]);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const stampFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const today = todayISO();

  function formatDay(iso: string) {
    return dateFmt.format(new Date(`${iso}T12:00:00`));
  }

  const ordered = useMemo(
    () => [...stays].sort((a, b) => b.checkIn.localeCompare(a.checkIn)),
    [stays],
  );
  const past = useMemo(
    () => ordered.filter((stay) => stay.checkOut <= today),
    [ordered, today],
  );

  async function uploadStayPhotos(stayId: string, kind: "in" | "out", files: FileList | null) {
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
      onChanged();
    } catch {
      setError(t("opsError"));
    } finally {
      setBusy(null);
    }
  }

  async function patchStay(stayId: string, action: "checkin" | "checkout") {
    const by = (action === "checkin" ? byIn[stayId] : byOut[stayId])?.trim() ?? "";
    if (!by) {
      setError(t("needBy"));
      return;
    }
    setBusy(`${action}:${stayId}`);
    setError(null);
    try {
      const res = await fetch("/api/owner/stays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stayId,
          action,
          by,
          time: action === "checkin" ? (timeIn[stayId] ?? "16:00") : (timeOut[stayId] ?? "10:00"),
        }),
      });
      if (!res.ok) {
        setError(res.status === 400 ? t("needBy") : t("opsError"));
        return;
      }
      onChanged();
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
    const cleanerName = String(data.get("cleanerName") ?? "").trim();
    if (!cleanerName) {
      setError(t("needBy"));
      return;
    }
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
          cleanerName,
          notes: String(data.get("notes") ?? ""),
          photos: cleanPhotos,
        }),
      });
      if (!res.ok) {
        setError(t("cleanError"));
        return;
      }
      form.reset();
      setCleanPhotos([]);
      onChanged();
    } catch {
      setError(t("cleanError"));
    } finally {
      setBusy(null);
    }
  }

  async function pickCleanPhotos(files: FileList | null) {
    if (!files?.length) return;
    const next: string[] = [];
    for (const file of Array.from(files).slice(0, 6)) {
      next.push(await compressFile(file));
    }
    setCleanPhotos(next);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("staysTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("staysLead")}</p>
        {ordered.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("staysEmpty")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-sand/40">
            {ordered.map((stay) => {
              const cleaned = cleanings.filter((row) => row.stayId === stay.id);
              return (
                <li key={stay.id} className="py-4 first:pt-0">
                  <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
                  <p className="text-sm text-foreground/70">
                    {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)} ·{" "}
                    {t("bookGuestsCount", { count: stay.guests })}
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {stay.checkedInAt
                      ? t("checkedInByWhen", {
                          name: stay.checkedInBy || "—",
                          when: stay.checkInTime
                            ? `${stampFmt.format(new Date(stay.checkedInAt))} · ${stay.checkInTime}`
                            : stampFmt.format(new Date(stay.checkedInAt)),
                        })
                      : t("checkInPending")}
                    {" · "}
                    {stay.checkedOutAt
                      ? t("checkedOutByWhen", {
                          name: stay.checkedOutBy || "—",
                          when: stay.checkOutTime
                            ? `${stampFmt.format(new Date(stay.checkedOutAt))} · ${stay.checkOutTime}`
                            : stampFmt.format(new Date(stay.checkedOutAt)),
                        })
                      : t("checkOutPending")}
                    {" · "}
                    {cleaned.length ? t("cleanedYes") : t("cleanedNo")}
                  </p>

                  {!stay.checkedInAt ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_auto]">
                      <input
                        value={byIn[stay.id] ?? ""}
                        onChange={(e) => setByIn((prev) => ({ ...prev, [stay.id]: e.target.value }))}
                        placeholder={t("checkBy")}
                        required
                        className="rounded-xl border border-sand/60 px-3 py-2 text-sm outline-none focus:border-lagoon"
                      />
                      <TimeSelect
                        value={timeIn[stay.id] ?? "16:00"}
                        onChange={(value) => setTimeIn((prev) => ({ ...prev, [stay.id]: value }))}
                      />
                      <button
                        type="button"
                        disabled={busy === `checkin:${stay.id}`}
                        onClick={() => void patchStay(stay.id, "checkin")}
                        className="rounded-full bg-lagoon px-4 py-2 text-sm font-medium text-white hover:bg-lagoon-dark disabled:opacity-60"
                      >
                        {t("markCheckIn")}
                      </button>
                    </div>
                  ) : null}

                  {stay.checkedInAt && !stay.checkedOutAt ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_auto]">
                      <input
                        value={byOut[stay.id] ?? ""}
                        onChange={(e) => setByOut((prev) => ({ ...prev, [stay.id]: e.target.value }))}
                        placeholder={t("checkBy")}
                        className="rounded-xl border border-sand/60 px-3 py-2 text-sm outline-none focus:border-lagoon"
                      />
                      <TimeSelect
                        value={timeOut[stay.id] ?? "10:00"}
                        onChange={(value) => setTimeOut((prev) => ({ ...prev, [stay.id]: value }))}
                      />
                      <button
                        type="button"
                        disabled={busy === `checkout:${stay.id}`}
                        onClick={() => void patchStay(stay.id, "checkout")}
                        className="rounded-full border border-lagoon px-4 py-2 text-sm font-medium text-lagoon hover:bg-lagoon hover:text-white disabled:opacity-60"
                      >
                        {t("markCheckOut")}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">{t("photosInTitle")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(stay.checkInPhotos ?? []).map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={`in-${stay.id}-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
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
                            void uploadStayPhotos(stay.id, "in", e.target.files);
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
                          <img key={`out-${stay.id}-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
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
                            void uploadStayPhotos(stay.id, "out", e.target.files);
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
            <TimeSelect id="clean-time" name="time" defaultValue="10:00" />
          </div>
          <div>
            <label htmlFor="cleanerName" className="mb-1 block text-sm font-medium">
              {t("cleanBy")}
            </label>
            <input
              id="cleanerName"
              name="cleanerName"
              required
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
            <label className="inline-block cursor-pointer text-sm font-medium text-lagoon">
              {t("addPhotos")}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  void pickCleanPhotos(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            {cleanPhotos.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {cleanPhotos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`prep-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" disabled={busy === "clean"}>
              {busy === "clean" ? t("cleanSaving") : t("cleanSubmit")}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("historyTitle")}</h2>
        <p className="mt-2 text-sm text-foreground/70">{t("historyLead")}</p>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t("historyEmpty")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-sand/40">
            {past.map((stay) => {
              const related = cleanings.filter((row) => row.stayId === stay.id);
              return (
                <li key={stay.id} className="py-4 first:pt-0">
                  <p className="font-medium text-lagoon-dark">{stayName(stay, t)}</p>
                  <p className="text-sm text-foreground/70">
                    {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)}
                    {stay.checkInTime ? ` · ${stay.checkInTime}` : ""}
                    {stay.checkOutTime ? ` → ${stay.checkOutTime}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-foreground/65">
                    {stay.checkedInBy
                      ? t("historyCheckIn", { name: stay.checkedInBy })
                      : t("checkInPending")}
                    {" · "}
                    {stay.checkedOutBy
                      ? t("historyCheckOut", { name: stay.checkedOutBy })
                      : t("checkOutPending")}
                  </p>
                  {related.map((row) => (
                    <p key={row.id} className="mt-1 text-xs text-foreground/65">
                      {t("historyClean", { name: ["marie", "luca"].includes(row.cleanerId) ? t(`cleaners.${row.cleanerId}`) : row.cleanerId, date: row.date, time: row.time })}
                    </p>
                  ))}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...(stay.checkInPhotos ?? []), ...(stay.checkOutPhotos ?? []), ...related.flatMap((row) => row.photos)].map(
                      (src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`${stay.id}-h-${i}`} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      ),
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
