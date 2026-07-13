import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SUPPORTED } from "../lib/i18n";

/**
 * Per-locale <title>, <meta description>, OpenGraph + hreflang alternates.
 * Drives SEO across 6 language indexes from a single rendered page.
 */
export default function SEO() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const title = t("seo.title");
  const description = t("seo.description");
  const ogLocale = t("seo.og_locale");

  const origin =
    typeof window !== "undefined" && window.location ? window.location.origin : "";
  const canonical = `${origin}/?lang=${lang}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />

      <link rel="canonical" href={canonical} />
      {SUPPORTED.map((lng) => (
        <link
          key={lng.code}
          rel="alternate"
          hrefLang={lng.code}
          href={`${origin}/?lang=${lng.code}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${origin}/`} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@CryptoFixYup" />
      <meta name="twitter:creator" content="@CryptoFixYup" />
    </Helmet>
  );
}
