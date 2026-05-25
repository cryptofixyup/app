import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import pl from "../locales/pl.json";
import ru from "../locales/ru.json";
import de from "../locales/de.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";

export const SUPPORTED = [
  { code: "en", name: "English" },
  { code: "pl", name: "Polski" },
  { code: "ru", name: "Русский" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
      ru: { translation: ru },
      de: { translation: de },
      es: { translation: es },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "pl", "ru", "de", "es", "fr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "sentinel_lang",
      caches: ["localStorage"],
    },
    returnNull: false,
  });

export default i18n;
