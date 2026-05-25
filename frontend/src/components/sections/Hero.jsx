import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2, Lock, Eye, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { API } from "../../lib/api";

const SHIELD_IMG =
  "https://static.prod-images.emergentagent.com/jobs/28c807d1-184d-41e8-8be7-e6af66862383/images/11cc3ae147f433d4a57839cb86b9c9aaffc7712af843ecb1e628fb258726d0bf.png";

export default function Hero() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("toasts.wl_invalid_hero"));
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, { email, source: "hero" });
      toast.success(t("toasts.wl_success_hero"));
      setEmail("");
    } catch {
      toast.error(t("toasts.wl_fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
      <div className="absolute inset-0 cyber-grid radial-mask pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,85,255,0.16) 0%, rgba(0,240,255,0.06) 30%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,0,127,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-3 px-3 py-1.5 mb-6 border border-white/10">
              <span className="pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/70">
                {t("hero.pill")}
              </span>
            </div>

            <h1
              id="waitlist"
              className="font-display text-white font-black text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-tighter mb-6"
            >
              {t("hero.headline_pre")}
              <br />
              <span style={{ color: "#00F0FF" }} className="glow-cyan">
                {t("hero.headline_highlight")}
              </span>
              {t("hero.headline_dot")}
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl mb-8 font-mono">
              {t("hero.sub")}
            </p>

            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6"
              data-testid="hero-waitlist-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("hero.placeholder")}
                className="flex-1 bg-[#0a0a0c] border border-white/10 px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] transition-colors font-mono text-sm"
                data-testid="hero-waitlist-email-input"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-neon disabled:opacity-60"
                data-testid="hero-waitlist-submit-button"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {t("hero.cta")}
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50 font-mono">
              <span className="flex items-center gap-2">
                <Compass size={12} style={{ color: "#00F0FF" }} /> {t("hero.trust1")}
              </span>
              <span className="flex items-center gap-2">
                <Lock size={12} style={{ color: "#FF007F" }} /> {t("hero.trust2")}
              </span>
              <span className="flex items-center gap-2">
                <Eye size={12} style={{ color: "#00F0FF" }} /> {t("hero.trust3")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative aspect-square max-w-[520px] mx-auto w-full"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[55%] aspect-square">
                <span className="ring-pulse" style={{ animationDelay: "0s" }} />
                <span className="ring-pulse" style={{ animationDelay: "0.8s" }} />
                <span className="ring-pulse" style={{ animationDelay: "1.6s" }} />
              </div>
            </div>
            <img
              src={SHIELD_IMG}
              alt="Sentinel Shield"
              className="relative z-10 w-full h-full object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 60px rgba(0,240,255,0.35)) drop-shadow(0 0 80px rgba(255,0,127,0.18))",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
