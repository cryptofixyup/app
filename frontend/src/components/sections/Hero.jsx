import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, Loader2, Activity, Lock, Eye, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { API } from "../../lib/api";

const SHIELD_IMG =
  "https://static.prod-images.emergentagent.com/jobs/28c807d1-184d-41e8-8be7-e6af66862383/images/11cc3ae147f433d4a57839cb86b9c9aaffc7712af843ecb1e628fb258726d0bf.png";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email to lock your spot.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, { email, source: "hero" });
      toast.success("You're in. Welcome to the Sentinel Network.");
      setEmail("");
    } catch (err) {
      toast.error("Could not save email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
      {/* Cyber-grid background */}
      <div className="absolute inset-0 cyber-grid radial-mask pointer-events-none" />
      {/* Ambient glows */}
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
          background:
            "radial-gradient(circle, rgba(255,0,127,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-3 px-3 py-1.5 mb-6 border border-white/10">
              <span className="pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/70">
                MYTHOS engine · LIVE · v0.9-beta
              </span>
            </div>

            <h1 className="font-display text-white font-black text-5xl md:text-6xl lg:text-7xl leading-[0.92] tracking-tighter mb-6">
              The Guardian for
              <br />
              the{" "}
              <span style={{ color: "#00F0FF" }} className="glow-cyan">
                Swipe Generation
              </span>
              .
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl mb-8 font-mono">
              Spot the invisible threats they don't want you to see. Forward any
              suspicious link, offer, or "AI-investment" dashboard to our bot —
              get a{" "}
              <span style={{ color: "#00FF66" }} className="font-bold">SAFE</span>{" "}
              or{" "}
              <span style={{ color: "#FF0033" }} className="font-bold">DANGER</span>{" "}
              verdict in seconds.
            </p>

            {/* Inline waitlist form */}
            <form
              onSubmit={submit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6"
              data-testid="hero-waitlist-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourwallet.xyz"
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
                Join Waitlist
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50 font-mono">
              <span className="flex items-center gap-2">
                <Lock size={12} style={{ color: "#00F0FF" }} /> Zero-Trust scanner
              </span>
              <span className="flex items-center gap-2">
                <Activity size={12} style={{ color: "#FF007F" }} /> 184,237 scams blocked
              </span>
              <span className="flex items-center gap-2">
                <Eye size={12} style={{ color: "#00F0FF" }} /> No wallet connect required
              </span>
            </div>
          </motion.div>

          {/* Right: shield visual */}
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
              style={{ filter: "drop-shadow(0 0 60px rgba(0,240,255,0.35)) drop-shadow(0 0 80px rgba(255,0,127,0.18))" }}
            />
            {/* HUD readouts */}
            <div className="absolute top-6 left-0 panel corners p-3 font-mono text-[10px] text-white/80" style={{ minWidth: 150 }}>
              <span className="tl"></span><span className="tr"></span>
              <div className="text-[#00F0FF] tracking-[0.2em]">NODE_001</div>
              <div className="text-white/60">scan_rate 482/s</div>
            </div>
            <div className="absolute bottom-10 right-0 panel corners p-3 font-mono text-[10px] text-white/80" style={{ minWidth: 170 }}>
              <span className="tl"></span><span className="tr"></span>
              <div className="text-[#FF007F] tracking-[0.2em]">MYTHOS_CORE</div>
              <div className="text-white/60">heuristics: 1,247</div>
              <div className="text-white/60">latency: 1.2s</div>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 panel corners p-2 font-mono text-[10px]" style={{ minWidth: 110 }}>
              <span className="tl"></span><span className="tr"></span>
              <div className="text-[#00FF66] flex items-center gap-2">
                <Zap size={10} /> SAFE
              </div>
              <div className="text-white/40">uniswap.org</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
