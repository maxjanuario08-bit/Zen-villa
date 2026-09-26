"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import TimeSelect from "@/components/owner/TimeSelect";
import { CLEANING_CHECKLIST_GROUPS, CLEANING_CHECKLIST_IDS } from "@/lib/cleaning-checklist";
import { todayISO } from "@/lib/booking";
import { readStaffName } from "@/lib/staff-name";
import { pipelineIndex, sortStaysForStaff, stayStep, type StayStep } from "@/lib/staff-next-step";
import { nearestTimeSlot } from "@/lib/time-slots";
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
  showHistory?: boolean;
};

export default function StaffOps({ slug, stays, cleanings, onChanged, showHistory = true }: Props) {
  const t = useTranslations("Compte");
  const tEq = useTranslations("Equipe");
  const locale = useLocale();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [by, setBy] = useState("");
  const [times, setTimes] = useState<Record<string, string>>({});
  const [cleanPhotos, setCleanPhotos] = useState<Record<string, string[]>>({});
  const [checked, setChecked] = useState<Record<string, Record<string, boolean>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openDone, setOpenDone] = useState(false);

  const dateFmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" });
  const today = todayISO();
  const nowSlot = nearestTimeSlot();

  useEffect(() => {
    setBy((prev) => prev || readStaffName());
  }, []);

  function formatDay(iso: string) {
    return dateFmt.format(new Date(`${iso}T12:00:00`));
  }

  const ranked = useMemo(
    () => sortStaysForStaff(stays, cleanings, today),
    [stays, cleanings, today],
  );

  const groups = useMemo(() => {
    const now: PaidStay[] = [];
    const later: PaidStay[] = [];
    const done: PaidStay[] = [];
    for (const stay of ranked) {
      const step = stayStep(stay, cleanings, today);
      if (step === "done") done.push(stay);
      else if (step === "wait" || step === "inhouse") later.push(stay);
      else now.push(stay);
    }
    return { now, later, done };
  }, [ranked, cleanings, today]);

  function slotFor(stayId: string) {
    return times[stayId] ?? nowSlot;
  }

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
    const who = by.trim() || readStaffName();
    if (!who) {
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
          by: who,
          time: slotFor(stayId),
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

  async function saveCleaning(stay: PaidStay) {
    const who = by.trim() || readStaffName();
    if (!who) {
      setError(t("needBy"));
      return;
    }
    const marks = checked[stay.id] ?? {};
    const checklist = CLEANING_CHECKLIST_IDS.filter((id) => marks[id]);
    if (checklist.length < CLEANING_CHECKLIST_IDS.length) {
      setError(tEq("checklistNeedAll"));
      return;
    }
    const photos = cleanPhotos[stay.id] ?? [];
    if (!photos.length) {
      setError(tEq("checklistNeedPhoto"));
      return;
    }
    setBusy(`clean:${stay.id}`);
    setError(null);
    try {
      const res = await fetch("/api/owner/cleanings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stayId: stay.id,
          date: today,
          time: slotFor(stay.id),
          cleanerName: who,
          notes: notes[stay.id] ?? "",
          photos,
          checklist,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          payload.error === "checklist"
            ? tEq("checklistNeedAll")
            : payload.error === "photo"
              ? tEq("checklistNeedPhoto")
              : t("cleanError"),
        );
        return;
      }
      setCleanPhotos((prev) => ({ ...prev, [stay.id]: [] }));
      onChanged();
    } catch {
      setError(t("cleanError"));
    } finally {
      setBusy(null);
    }
  }

  async function pickCleanPhotos(stayId: string, files: FileList | null) {
    if (!files?.length) return;
    const next: string[] = [];
    for (const file of Array.from(files).slice(0, 6)) {
      next.push(await compressFile(file));
    }
    setCleanPhotos((prev) => ({ ...prev, [stayId]: next }));
  }

  function nextCopy(step: StayStep, stay: PaidStay) {
    if (step === "checkin") return tEq("nextCheckin");
    if (step === "checkout") return tEq("nextCheckout");
    if (step === "clean") return tEq("nextClean");
    if (step === "inhouse") return tEq("nextInhouse", { date: formatDay(stay.checkOut) });
    if (step === "wait") return tEq("nextWait", { date: formatDay(stay.checkIn) });
    return tEq("nextDone");
  }

  function StayCard({ stay }: { stay: PaidStay }) {
    const step = stayStep(stay, cleanings, today);
    const pipe = pipelineIndex(step);
    const photos = cleanPhotos[stay.id] ?? [];
    const marks = checked[stay.id] ?? {};
    const checkedCount = CLEANING_CHECKLIST_IDS.filter((id) => marks[id]).length;

    return (
      <article className="rounded-2xl border border-sand/40 bg-white p-4 shadow-card sm:p-5">
        <p className="font-serif text-xl font-semibold text-lagoon-dark">{stayName(stay, t)}</p>
        <p className="mt-1 text-sm text-foreground/70">
          {formatDay(stay.checkIn)} → {formatDay(stay.checkOut)} · {t("bookGuestsCount", { count: stay.guests })}
        </p>
        <ol className="mt-3 flex gap-1 text-[11px] font-medium uppercase tracking-wide sm:text-xs">
          {[tEq("pipeIn"), tEq("pipeOut"), tEq("pipeClean")].map((label, i) => (
            <li
              key={label}
              className={`flex-1 rounded-full px-2 py-1 text-center ${
                i < pipe
                  ? "bg-lagoon text-white"
                  : i === pipe && (step === "checkin" || step === "checkout" || step === "clean" || step === "inhouse")
                    ? "bg-sand-dark text-lagoon-dark"
                    : "bg-sand-light text-foreground/50"
              }`}
            >
              {i < pipe ? `✓ ${label}` : label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-base font-medium text-lagoon-dark">{nextCopy(step, stay)}</p>

        {step === "checkin" || step === "checkout" || step === "wait" || step === "inhouse" ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-[1fr_7.5rem] gap-2">
              <input
                value={by}
                onChange={(e) => setBy(e.target.value)}
                placeholder={t("checkBy")}
                className="rounded-xl border border-sand/60 px-3 py-3 text-base outline-none focus:border-lagoon"
              />
              <TimeSelect
                value={slotFor(stay.id)}
                onChange={(value) => setTimes((prev) => ({ ...prev, [stay.id]: value }))}
              />
            </div>
            {step === "checkin" || step === "wait" ? (
              <button
                type="button"
                disabled={busy === `checkin:${stay.id}`}
                onClick={() => void patchStay(stay.id, "checkin")}
                className={`w-full rounded-full py-3.5 text-base font-semibold disabled:opacity-60 ${
                  step === "checkin"
                    ? "bg-lagoon text-white hover:bg-lagoon-dark"
                    : "border-2 border-lagoon text-lagoon hover:bg-lagoon hover:text-white"
                }`}
              >
                {step === "wait" ? tEq("doCheckinEarly") : tEq("doCheckin")}
              </button>
            ) : null}
            {step === "checkout" || step === "inhouse" ? (
              <button
                type="button"
                disabled={busy === `checkout:${stay.id}`}
                onClick={() => void patchStay(stay.id, "checkout")}
                className={`w-full rounded-full py-3.5 text-base font-semibold disabled:opacity-60 ${
                  step === "checkout"
                    ? "bg-lagoon text-white hover:bg-lagoon-dark"
                    : "border-2 border-lagoon text-lagoon hover:bg-lagoon hover:text-white"
                }`}
              >
                {step === "inhouse" ? tEq("doCheckoutEarly") : tEq("doCheckout")}
              </button>
            ) : null}
            <label className="block cursor-pointer text-sm font-medium text-lagoon">
              {step === "checkout" || step === "inhouse" ? tEq("photosOutOptional") : tEq("photosInOptional")}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="sr-only"
                onChange={(e) => {
                  void uploadStayPhotos(
                    stay.id,
                    step === "checkout" || step === "inhouse" ? "out" : "in",
                    e.target.files,
                  );
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        ) : null}

        {step === "clean" ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-foreground/70">{tEq("checklistLeadShort")}</p>
            <p className="text-xs font-medium text-foreground/55">
              {tEq("checklistProgress", {
                done: checkedCount,
                total: CLEANING_CHECKLIST_IDS.length,
              })}
            </p>
            {CLEANING_CHECKLIST_GROUPS.map((group) => (
              <fieldset key={group.id} className="rounded-xl bg-sand-light/80 p-3">
                <legend className="px-1 text-sm font-semibold text-lagoon-dark">
                  {tEq(`checklistGroups.${group.id}`)}
                </legend>
                <ul className="mt-1 space-y-2">
                  {group.items.map((id) => (
                    <li key={id}>
                      <label className="flex items-start gap-3 text-sm leading-snug text-foreground/90">
                        <input
                          type="checkbox"
                          checked={Boolean(marks[id])}
                          onChange={(e) =>
                            setChecked((prev) => ({
                              ...prev,
                              [stay.id]: { ...prev[stay.id], [id]: e.target.checked },
                            }))
                          }
                          className="mt-0.5 h-5 w-5 shrink-0 rounded border-sand/60 text-lagoon focus:ring-lagoon"
                        />
                        <span>{tEq(`checklistItems.${id}`)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ))}
            <textarea
              value={notes[stay.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [stay.id]: e.target.value }))}
              rows={2}
              placeholder={t("cleanNotes")}
              className="w-full rounded-xl border border-sand/60 px-3 py-2.5 text-sm outline-none focus:border-lagoon"
            />
            <div>
              <label className="inline-block cursor-pointer rounded-full bg-sand-dark px-4 py-2 text-sm font-medium text-lagoon-dark">
                {photos.length
                  ? tEq("checklistPhotoDone", { count: photos.length })
                  : tEq("checklistAddPhoto")}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    void pickCleanPhotos(stay.id, e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {photos.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={`${stay.id}-p-${i}`} src={src} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              disabled={busy === `clean:${stay.id}`}
              onClick={() => void saveCleaning(stay)}
              className="w-full rounded-full bg-lagoon py-3.5 text-base font-semibold text-white hover:bg-lagoon-dark disabled:opacity-60"
            >
              {busy === `clean:${stay.id}` ? t("cleanSaving") : tEq("doClean")}
            </button>
          </div>
        ) : null}

        {step === "done" ? (
          <p className="mt-2 text-sm text-foreground/60">{tEq("stayComplete")}</p>
        ) : null}
      </article>
    );
  }

  return (
    <div className="space-y-8">
      {stays.length === 0 ? (
        <p className="rounded-2xl border border-sand/40 bg-white p-5 text-sm text-muted shadow-card">{t("staysEmpty")}</p>
      ) : (
        <>
          <section>
            <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{tEq("nowTitle")}</h2>
            <p className="mt-1 text-sm text-foreground/70">{tEq("nowLead")}</p>
            {groups.now.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">{tEq("nowEmpty")}</p>
            ) : (
              <div className="mt-4 space-y-4">
                {groups.now.map((stay) => (
                  <StayCard key={stay.id} stay={stay} />
                ))}
              </div>
            )}
          </section>

          {groups.later.length ? (
            <section>
              <h2 className="font-serif text-xl font-semibold text-lagoon-dark">{tEq("laterTitle")}</h2>
              <div className="mt-3 space-y-4">
                {groups.later.map((stay) => (
                  <StayCard key={stay.id} stay={stay} />
                ))}
              </div>
            </section>
          ) : null}

          {showHistory && groups.done.length ? (
            <section>
              <button
                type="button"
                onClick={() => setOpenDone((prev) => !prev)}
                className="text-left font-serif text-xl font-semibold text-lagoon-dark"
              >
                {tEq("doneTitle")} ({groups.done.length}) {openDone ? "▴" : "▾"}
              </button>
              {openDone ? (
                <div className="mt-3 space-y-4">
                  {groups.done.map((stay) => (
                    <StayCard key={stay.id} stay={stay} />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
