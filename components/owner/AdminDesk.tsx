"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Account = {
  email: string;
  name: string;
  logements: string[];
  propertyNote: string;
  createdAt: string;
};

type Villa = { slug: string; copyKey: string };

export default function AdminDesk() {
  const t = useTranslations("Admin");
  const tLogements = useTranslations("Logements");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const villaName = useCallback(
    (slug: string) => {
      const villa = villas.find((item) => item.slug === slug);
      if (!villa) return slug;
      return tLogements(`${villa.copyKey}.name`);
    },
    [tLogements, villas],
  );

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/accounts");
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = (await res.json()) as { accounts: Account[]; logements: Villa[] };
      setAccounts(data.accounts ?? []);
      setVillas(data.logements ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function link(email: string) {
    const slug = choice[email] || villas[0]?.slug;
    if (!slug) return;
    setBusy(email);
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      await load();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  async function unlink(email: string, slug: string) {
    setBusy(`${email}:${slug}`);
    setError(false);
    try {
      const res = await fetch("/api/owner/admin/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      await load();
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-foreground/70">{t("loading")}</p>;
  }

  if (accounts.length === 0) {
    return (
      <Card hover={false}>
        <p className="text-sm text-foreground/70">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{t("actionError")}</p>}
      {accounts.map((account) => (
        <Card key={account.email} hover={false}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-lagoon-dark">{account.name}</p>
              <p className="text-sm text-foreground/70">{account.email}</p>
              {account.propertyNote ? (
                <p className="mt-1 text-sm text-foreground/80">
                  {t("note")}: {account.propertyNote}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {account.logements.length === 0 ? (
                  <p className="text-sm text-foreground/55">{t("noVilla")}</p>
                ) : (
                  account.logements.map((slug) => (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-2 rounded-full bg-sand-light px-3 py-1 text-sm"
                    >
                      {villaName(slug)}
                      <button
                        type="button"
                        className="text-foreground/50 hover:text-red-700"
                        disabled={busy === `${account.email}:${slug}`}
                        onClick={() => void unlink(account.email, slug)}
                      >
                        {t("unlink")}
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="flex min-w-[16rem] flex-col gap-2 sm:items-end">
              <label className="sr-only" htmlFor={`villa-${account.email}`}>
                {t("chooseVilla")}
              </label>
              <select
                id={`villa-${account.email}`}
                className="w-full rounded-xl border border-sand/60 bg-white px-3 py-2 text-sm outline-none focus:border-lagoon"
                value={choice[account.email] ?? villas[0]?.slug ?? ""}
                onChange={(e) => setChoice((prev) => ({ ...prev, [account.email]: e.target.value }))}
              >
                {villas.map((villa) => (
                  <option key={villa.slug} value={villa.slug}>
                    {villaName(villa.slug)}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={busy === account.email || villas.length === 0}
                onClick={() => void link(account.email)}
              >
                {busy === account.email ? t("linking") : t("link")}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
