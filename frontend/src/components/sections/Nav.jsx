import { useState } from "react";
import { Menu, X, ShieldHalf } from "lucide-react";

const links = [
  { label: "Scanner", href: "#scanner" },
  { label: "Modules", href: "#modules" },
  { label: "Threats", href: "#threats" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(5, 5, 5, 0.7)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      data-testid="site-nav"
    >
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
        <a href="#top" className="flex items-center gap-2" data-testid="brand-logo">
          <span className="relative inline-flex">
            <ShieldHalf
              size={22}
              strokeWidth={2}
              style={{ color: "#00F0FF", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.7))" }}
            />
          </span>
          <span className="font-display font-black text-white text-sm md:text-base tracking-tight">
            SCAM-LINK<span style={{ color: "#00F0FF" }}>.</span>SENTINEL
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs uppercase tracking-[0.18em] text-white/70 hover:text-[#00F0FF] transition-colors font-mono"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#pricing"
          className="hidden md:inline-flex btn-neon"
          style={{ padding: "10px 18px", fontSize: 11 }}
          data-testid="nav-cta-button"
        >
          Join Beta
        </a>

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
          className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-3"
          style={{ background: "rgba(5,5,5,0.95)" }}
          data-testid="mobile-menu"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.18em] text-white/80 font-mono py-2"
            >
              {l.label}
            </a>
          ))}
          <a href="#pricing" onClick={() => setOpen(false)} className="btn-neon mt-2 justify-center">
            Join Beta
          </a>
        </div>
      )}
    </header>
  );
}
