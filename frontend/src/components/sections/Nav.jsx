import { useState } from "react";
import { Menu, X, ShieldHalf } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../LanguageSelector";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const links = [
    { key: "scanner", href: "#scanner" },
    { key: "modules", href: "#modules" },
    { key: "mythos_guard", href: "#mythos-guard" },
    { key: "how", href: "#how-it-works" },
    { key: "contact", href: "#contact" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ background: "rgba(5, 5, 5, 0.7)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
      data-testid="site-nav"
    >
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
        <a href="#top" className="flex items-center gap-2" data-testid="brand-logo">
          <ShieldHalf size={22} strokeWidth={2} style={{ color: "#00F0FF", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.7))" }} />
          <span className="font-display font-black text-white text-sm md:text-base tracking-tight">
            SCAM-LINK<span style={{ color: "#00F0FF" }}>.</span>SENTINEL
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="text-xs uppercase tracking-[0.18em] text-white/70 hover:text-[#00F0FF] transition-colors font-mono"
              data-testid={`nav-link-${l.key}`}
            >
              {t(`nav.${l.key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector variant="bar" />
          <a
            href="#waitlist"
            className="btn-neon"
            style={{ padding: "10px 18px", fontSize: 11 }}
            data-testid="nav-cta-button"
          >
            {t("nav.join_waitlist")}
          </a>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t border-white/5 px-6 py-5 flex flex-col gap-5"
          style={{ background: "rgba(5,5,5,0.96)" }}
          data-testid="mobile-menu"
        >
          {/* Flags at TOP of drawer — high-contrast, tap-friendly */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF] mb-3">
              {t("lang.label")}
            </div>
            <LanguageSelector variant="grid" />
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.18em] text-white/80 font-mono py-1.5"
                data-testid={`mobile-nav-link-${l.key}`}
              >
                {t(`nav.${l.key}`)}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="btn-neon mt-2 justify-center"
              data-testid="mobile-nav-cta"
            >
              {t("nav.join_waitlist")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
