export type CountryCallingCode = {
  iso: string;
  dial: string;
};

/** France first, then frequent EU visitors, then a broader list. */
export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  { iso: "FR", dial: "+33" },
  { iso: "IT", dial: "+39" },
  { iso: "ES", dial: "+34" },
  { iso: "GB", dial: "+44" },
  { iso: "DE", dial: "+49" },
  { iso: "BE", dial: "+32" },
  { iso: "CH", dial: "+41" },
  { iso: "NL", dial: "+31" },
  { iso: "PT", dial: "+351" },
  { iso: "LU", dial: "+352" },
  { iso: "AT", dial: "+43" },
  { iso: "IE", dial: "+353" },
  { iso: "MC", dial: "+377" },
  { iso: "AD", dial: "+376" },
  { iso: "GR", dial: "+30" },
  { iso: "PL", dial: "+48" },
  { iso: "CZ", dial: "+420" },
  { iso: "SE", dial: "+46" },
  { iso: "DK", dial: "+45" },
  { iso: "NO", dial: "+47" },
  { iso: "FI", dial: "+358" },
  { iso: "HU", dial: "+36" },
  { iso: "RO", dial: "+40" },
  { iso: "BG", dial: "+359" },
  { iso: "HR", dial: "+385" },
  { iso: "SK", dial: "+421" },
  { iso: "SI", dial: "+386" },
  { iso: "LT", dial: "+370" },
  { iso: "LV", dial: "+371" },
  { iso: "EE", dial: "+372" },
  { iso: "MT", dial: "+356" },
  { iso: "CY", dial: "+357" },
  { iso: "US", dial: "+1" },
  { iso: "CA", dial: "+1" },
  { iso: "AU", dial: "+61" },
  { iso: "NZ", dial: "+64" },
  { iso: "MA", dial: "+212" },
  { iso: "TN", dial: "+216" },
  { iso: "DZ", dial: "+213" },
  { iso: "BR", dial: "+55" },
  { iso: "MX", dial: "+52" },
  { iso: "AR", dial: "+54" },
  { iso: "JP", dial: "+81" },
  { iso: "CN", dial: "+86" },
  { iso: "IN", dial: "+91" },
  { iso: "AE", dial: "+971" },
  { iso: "IL", dial: "+972" },
  { iso: "ZA", dial: "+27" },
  { iso: "TR", dial: "+90" },
  { iso: "UA", dial: "+380" },
];

export const DEFAULT_COUNTRY_ISO = "FR";

export function countryByIso(iso: string): CountryCallingCode {
  return COUNTRY_CALLING_CODES.find((c) => c.iso === iso) ?? COUNTRY_CALLING_CODES[0];
}

/** Combine country dial code + national digits into E.164-like +XXXXXXXX. */
export function composeInternationalPhone(dial: string, national: string): string {
  const trimmed = national.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return trimmed.replace(/[\s.-]/g, "");
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  const nationalDigits = digits.replace(/^0+/, "") || digits;
  return `${dial}${nationalDigits}`;
}

export function internationalPhoneFromForm(formData: FormData): string {
  const iso = String(formData.get("phoneCountry") ?? DEFAULT_COUNTRY_ISO);
  const national = String(formData.get("telephoneNational") ?? "");
  return composeInternationalPhone(countryByIso(iso).dial, national);
}
