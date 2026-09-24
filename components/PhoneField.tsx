"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_ISO,
  composeInternationalPhone,
  countryByIso,
} from "@/lib/country-calling-codes";

const controlClass =
  "rounded-xl border border-sand/60 bg-white px-3 py-2.5 text-foreground outline-none transition-colors focus:border-lagoon focus:ring-1 focus:ring-lagoon";

type Props = {
  id?: string;
  required?: boolean;
  placeholder?: string;
};

export default function PhoneField({ id = "telephone", required, placeholder }: Props) {
  const t = useTranslations("PhoneField");
  const rootRef = useRef<HTMLDivElement>(null);
  const [iso, setIso] = useState(DEFAULT_COUNTRY_ISO);
  const [national, setNational] = useState("");

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      setIso(DEFAULT_COUNTRY_ISO);
      setNational("");
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const international = composeInternationalPhone(countryByIso(iso).dial, national);

  return (
    <div ref={rootRef} className="flex gap-2">
      <label htmlFor={`${id}-country`} className="sr-only">
        {t("countryAria")}
      </label>
      <select
        id={`${id}-country`}
        name="phoneCountry"
        value={iso}
        onChange={(e) => setIso(e.target.value)}
        aria-label={t("countryAria")}
        className={`${controlClass} w-[9.75rem] shrink-0 sm:w-[11.5rem]`}
      >
        {COUNTRY_CALLING_CODES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.dial} {t(`countries.${c.iso}`)}
          </option>
        ))}
      </select>
      <input
        id={id}
        name="telephoneNational"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        value={national}
        onChange={(e) => setNational(e.target.value)}
        placeholder={placeholder ?? t("placeholder")}
        aria-label={t("numberAria")}
        className={`${controlClass} min-w-0 flex-1 px-4`}
      />
      <input type="hidden" name="telephone" value={international} />
    </div>
  );
}
