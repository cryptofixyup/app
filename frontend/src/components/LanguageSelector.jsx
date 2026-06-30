import { useTranslation } from "react-i18next";
import { SUPPORTED } from "../lib/i18n";
import { FLAG_MAP } from "./Flags";

/**
 * Two render modes:
 *  - variant="grid"  → big tap-friendly flag tiles (mobile drawer header)
 *  - variant="bar"   → compact horizontal flag strip (desktop nav)
 */
export default function LanguageSelector({ variant = "bar", className = "" }) {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || "en";

  const change = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem("sentinel_lang", code);
    } catch {
      /* localStorage unavailable — non-fatal */
    }
    document.documentElement.lang = code;
  };

  if (variant === "grid") {
    return (
      <div
        className={`lang-grid ${className}`}
        role="group"
        aria-label={t("lang.label")}
        data-testid="language-selector-grid"
      >
        {SUPPORTED.map((lng) => {
          const Flag = FLAG_MAP[lng.code];
          const active = current === lng.code;
          return (
            <button
              key={lng.code}
              onClick={() => change(lng.code)}
              className={`lang-tile ${active ? "lang-tile--active" : ""}`}
              aria-pressed={active}
              data-testid={`lang-tile-${lng.code}`}
            >
              <span className="lang-tile-flag">
                <Flag width="44" height="30" />
              </span>
              <span className="lang-tile-label">{lng.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // bar variant
  return (
    <div
      className={`lang-bar ${className}`}
      role="group"
      aria-label={t("lang.label")}
      data-testid="language-selector-bar"
    >
      {SUPPORTED.map((lng) => {
        const Flag = FLAG_MAP[lng.code];
        const active = current === lng.code;
        return (
          <button
            key={lng.code}
            onClick={() => change(lng.code)}
            className={`lang-chip ${active ? "lang-chip--active" : ""}`}
            title={lng.name}
            aria-label={lng.name}
            aria-pressed={active}
            data-testid={`lang-chip-${lng.code}`}
          >
            <Flag width="22" height="15" />
          </button>
        );
      })}
    </div>
  );
}
