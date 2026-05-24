import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check, Loader2, ArrowRight, Crown } from "lucide-react";
import { API } from "../../lib/api";

const PERKS = [
  "Lifetime-locked $4.99/mo rate (price rises to $14.99 at launch)",
  "Founder badge in Telegram + WhatsApp bot",
  "Priority queue: scans run before public users",
  "Early access to MYTHOS API + custom heuristics",
  "Vote on threat feed sources & roadmap",
  "Private 'Sentinel Circle' Telegram channel",
];

export default function Pricing() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    setLoading(true);
    try {
      // Best-effort: also save to waitlist
      if (email && email.includes("@")) {
        axios.post(`${API}/waitlist`, { email, source: "pricing" }).catch(() => {});
      }
      const { data } = await axios.post(`${API}/checkout/session`, {
        package_id: "founding_member",
        origin_url: window.location.origin,
        email: email && email.includes("@") ? email : null,
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not start checkout.");
      }
    } catch (e) {
      toast.error("Checkout unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#FF007F] mb-4">
            // FOUNDING_MEMBER_TIER
          </div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight mb-4">
            Lock the founder rate. Forever.
          </h2>
          <p className="text-white/60 font-mono text-sm md:text-base max-w-xl mx-auto">
            Only 5,000 founding seats. Price rises to <span className="text-white">$14.99/mo</span>{" "}
            on public launch. Your rate stays locked.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-0">
          {/* Left panel - perks */}
          <div className="panel corners p-8 md:p-10 relative">
            <span className="tl"></span>
            <span className="tr"></span>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  border: "1px solid #7000FF",
                  background: "rgba(112,0,255,0.15)",
                  color: "#7000FF",
                  boxShadow: "0 0 20px rgba(112,0,255,0.5)",
                }}
              >
                <Crown size={18} strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                  Tier 01
                </div>
                <div className="font-display text-white text-lg md:text-xl tracking-tight">
                  Founding Member
                </div>
              </div>
            </div>

            <ul className="space-y-3.5">
              {PERKS.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-white/80 font-mono leading-relaxed">
                  <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#00FF66" }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel - CTA */}
          <div
            className="relative p-8 md:p-10 corners"
            style={{
              background:
                "linear-gradient(160deg, rgba(0,240,255,0.08) 0%, rgba(255,0,127,0.06) 50%, rgba(112,0,255,0.10) 100%)",
              border: "1px solid #00F0FF",
              boxShadow: "0 0 60px rgba(0,240,255,0.18)",
            }}
            data-testid="pricing-cta-panel"
          >
            <span className="tl" style={{ borderColor: "#00F0FF" }}></span>
            <span className="tr" style={{ borderColor: "#00F0FF" }}></span>

            <div className="absolute top-4 right-4 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ border: "1px solid #00F0FF", color: "#00F0FF", background: "#050505" }}>
              Beta · Limited
            </div>

            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 mb-3">
              Price (locked for life)
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-black text-white text-6xl md:text-7xl tracking-tighter glow-cyan">
                $4
              </span>
              <span className="font-display font-black text-white/80 text-3xl">.99</span>
              <span className="font-mono text-white/50 text-sm">/ month</span>
            </div>
            <div className="font-mono text-xs text-white/40 line-through mb-8">
              regular $14.99/mo
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email for receipt + founder badge"
              className="w-full bg-[#050505] border border-white/15 px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors mb-3"
              data-testid="pricing-email-input"
            />

            <button
              onClick={checkout}
              disabled={loading}
              className="btn-neon w-full justify-center disabled:opacity-60"
              data-testid="pricing-checkout-button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  <ArrowRight size={16} /> Become a Founding Member
                </>
              )}
            </button>

            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 mt-4 text-center">
              Stripe · Cancel anytime · Secure checkout
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
