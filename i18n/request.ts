import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "@/messages/locales/en";
import es from "@/messages/locales/es";
import fr from "@/messages/locales/fr";

const catalogs = {
  fr,
  en,
  es,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: catalogs[locale],
  };
});
