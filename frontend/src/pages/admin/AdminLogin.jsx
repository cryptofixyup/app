import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ShieldHalf, Lock, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { login } from "../../lib/adminApi";
import NoIndex from "../../components/NoIndex";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Access granted. Welcome, Founder.");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : "Invalid email or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "#050505" }}
      data-testid="admin-login-page"
    >
      <NoIndex title="Admin — Scam-Link Sentinel" />
      <div className="absolute inset-0 cyber-grid radial-mask pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 65%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#00F0FF] font-mono text-[11px] uppercase tracking-[0.22em] mb-6 transition-colors"
          data-testid="admin-back-link"
        >
          <ArrowLeft size={14} /> back to site
        </Link>

        <div className="panel corners p-8 md:p-10 relative">
          <span className="tl"></span>
          <span className="tr"></span>

          <div className="flex items-center gap-3 mb-1">
            <ShieldHalf size={22} style={{ color: "#00F0FF", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.7))" }} />
            <span className="font-display font-black text-white text-sm tracking-tight">
              SCAM-LINK<span style={{ color: "#00F0FF" }}>.</span>SENTINEL
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF] mb-6">
            // ADMIN_PERIMETER
          </div>

          <h1 className="font-display font-black text-white text-3xl tracking-tight mb-2">
            Founder access.
          </h1>
          <p className="text-white/55 font-mono text-sm mb-8">
            Restricted. JWT-gated. All access is logged.
          </p>

          <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@scamlinksentinel.io"
                className="w-full bg-[#050505] border border-white/15 px-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors"
                data-testid="admin-login-email-input"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-[#050505] border border-white/15 pl-11 pr-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors"
                  data-testid="admin-login-password-input"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className="border border-[#FF0033]/50 bg-[#FF0033]/8 px-4 py-3 font-mono text-xs text-[#FF0033]"
                data-testid="admin-login-error"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full justify-center disabled:opacity-60"
              data-testid="admin-login-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  <ArrowRight size={16} /> Authenticate
                </>
              )}
            </button>
          </form>

          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 mt-6 text-center">
            JWT · 24h session · single-account perimeter
          </div>
        </div>
      </div>
    </div>
  );
}
