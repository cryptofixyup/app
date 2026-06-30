import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ShieldHalf, ArrowRight, Loader2, Mail, Github, Send } from "lucide-react";
import { API } from "../../lib/api";

function XIcon({ size = 14, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...rest}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.213-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const CONTACTS = [
    { label: t("footer.contact_x"),         value: "@CryptoFixYup",  href: "https://x.com/CryptoFixYup",      icon: XIcon,  testid: "footer-contact-x" },
    { label: t("footer.contact_github"),    value: "cryptofixyup",   href: "https://github.com/cryptofixyup",  icon: Github, testid: "footer-contact-github" },
    { label: t("footer.contact_email"),     value: "kpiotr210@gmail.com", href: "mailto:kpiotr210@gmail.com",  icon: Mail,   testid: "footer-contact-email" },
    { label: t("footer.contact_telegram"),  value: "@cryptofixyuup", href: "https://t.me/cryptofixyuup",       icon: Send,   testid: "footer-contact-telegram" },
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { toast.error(t("toasts.wl_invalid")); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, { email, source: "footer" });
      toast.success(t("toasts.wl_success_footer"));
      setEmail("");
    } catch { toast.error(t("toasts.wl_fail")); }
    finally { setLoading(false); }
  };

  return (
    <footer id="contact" className="relative border-t border-white/10 mt-8" style={{ background: "#070708" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12"
        style={{ background: "linear-gradient(180deg, transparent, #00F0FF, transparent)" }}
      />

      <div className="border-b border-white/10 py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
              {t("footer.final_kicker")}
            </div>
            <h3 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight leading-[1.1]">
              {t("footer.final_headline_l1")}<br />{t("footer.final_headline_l2")}
            </h3>
          </div>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={submit} data-testid="footer-waitlist-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourwallet.xyz"
              className="flex-1 bg-[#0a0a0c] border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors"
              data-testid="footer-email-input"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-neon disabled:opacity-60"
              data-testid="footer-submit-button"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {t("footer.join")}
            </button>
          </form>
        </div>
      </div>

      <div className="border-b border-white/10 px-6 md:px-12 lg:px-20 py-14">
        <div className="max-w-[1300px] mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-3">
              {t("footer.direct_kicker")}
            </div>
            <h3 className="font-display font-black text-white text-2xl md:text-3xl tracking-tight leading-[1.1] mb-3">
              {t("footer.talk_l1")}<br />
              <span style={{ color: "#00F0FF" }} className="glow-cyan">{t("footer.talk_l2")}</span>
            </h3>
            <p className="text-white/55 font-mono text-sm leading-relaxed max-w-md">
              {t("footer.talk_sub")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3" data-testid="footer-contact-grid">
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="contact-link group"
                data-testid={c.testid}
              >
                <span className="contact-icon">
                  <c.icon size={14} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 group-hover:text-[#00F0FF] transition-colors">
                    {c.label}
                  </span>
                  <span className="block font-display font-bold text-white text-sm md:text-base tracking-tight truncate group-hover:text-[#00F0FF] transition-colors">
                    {c.value}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="text-white/30 group-hover:text-[#00F0FF] group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldHalf size={20} style={{ color: "#00F0FF", filter: "drop-shadow(0 0 6px rgba(0,240,255,0.7))" }} />
            <div>
              <div className="font-display font-black text-white text-sm tracking-tight">
                SCAM-LINK<span style={{ color: "#00F0FF" }}>.</span>SENTINEL
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                {t("footer.brand_tagline")}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
            <a href="https://x.com/CryptoFixYup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#00F0FF]" data-testid="footer-bottom-x"><XIcon size={11} /> @CryptoFixYup</a>
            <a href="https://github.com/cryptofixyup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#00F0FF]" data-testid="footer-bottom-github"><Github size={11} /> cryptofixyup</a>
            <a href="https://t.me/cryptofixyuup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#00F0FF]" data-testid="footer-bottom-telegram"><Send size={11} /> @cryptofixyuup</a>
            <a href="mailto:kpiotr210@gmail.com" className="inline-flex items-center gap-1.5 hover:text-[#FF007F]" data-testid="footer-bottom-email"><Mail size={11} /> kpiotr210@gmail.com</a>
            <span className="text-white/25">© 2025 DeFi Guardian Labs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
