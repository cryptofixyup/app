import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ShieldHalf, ArrowRight, Loader2 } from "lucide-react";
import { API } from "../../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, { email, source: "footer" });
      toast.success("Locked. We'll ping you when MYTHOS goes live.");
      setEmail("");
    } catch {
      toast.error("Could not save. Retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative border-t border-white/10 mt-8" style={{ background: "#070708" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12"
        style={{ background: "linear-gradient(180deg, transparent, #00F0FF, transparent)" }}
      />

      {/* Final CTA strip */}
      <div className="border-b border-white/10 py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
              // FINAL_PERIMETER
            </div>
            <h3 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight leading-[1.1]">
              The next scam is being written
              <br />
              right now. Be on the list.
            </h3>
          </div>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={submit} data-testid="footer-waitlist-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourwallet.xyz"
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
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldHalf
              size={20}
              style={{ color: "#00F0FF", filter: "drop-shadow(0 0 6px rgba(0,240,255,0.7))" }}
            />
            <div>
              <div className="font-display font-black text-white text-sm tracking-tight">
                SCAM-LINK<span style={{ color: "#00F0FF" }}>.</span>SENTINEL
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                A DeFi Guardian product · Alpha-Sentinel v0.9
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
            <a href="#" className="hover:text-[#00F0FF]">Privacy</a>
            <a href="#" className="hover:text-[#00F0FF]">Terms</a>
            <a href="#" className="hover:text-[#00F0FF]">Security</a>
            <a href="#" className="hover:text-[#FF007F]">Report a scam</a>
            <span className="text-white/30">© 2025 DeFi Guardian Labs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
