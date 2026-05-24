import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { API } from "../lib/api";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState({ state: "checking", payment_status: null });

  useEffect(() => {
    if (!sessionId) {
      setStatus({ state: "no-session", payment_status: null });
      return;
    }
    let attempts = 0;
    const maxAttempts = 6;
    let timer;

    const poll = async () => {
      try {
        const { data } = await axios.get(`${API}/checkout/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setStatus({ state: "paid", payment_status: "paid", amount: data.amount_total, currency: data.currency });
          return;
        }
        if (data.status === "expired") {
          setStatus({ state: "expired", payment_status: data.payment_status });
          return;
        }
        attempts += 1;
        if (attempts >= maxAttempts) {
          setStatus({ state: "timeout", payment_status: data.payment_status });
          return;
        }
        timer = setTimeout(poll, 2000);
      } catch {
        attempts += 1;
        if (attempts >= maxAttempts) {
          setStatus({ state: "error", payment_status: null });
          return;
        }
        timer = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [sessionId]);

  const isPaid = status.state === "paid";
  const isWorking = status.state === "checking";
  const isFail = ["expired", "error", "timeout", "no-session"].includes(status.state);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#050505" }}
      data-testid="success-page"
    >
      <div className="absolute inset-0 cyber-grid radial-mask pointer-events-none" />
      <div className="relative panel corners max-w-xl w-full p-10 text-center">
        <span className="tl"></span>
        <span className="tr"></span>

        {isWorking && (
          <>
            <Loader2 size={48} className="mx-auto mb-6 animate-spin" style={{ color: "#00F0FF" }} />
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00F0FF] mb-3">
              Verifying transaction
            </div>
            <h1 className="font-display font-black text-white text-3xl tracking-tight mb-3">
              Confirming your founder badge…
            </h1>
            <p className="text-white/60 font-mono text-sm">
              We're polling Stripe. This usually takes under 5 seconds.
            </p>
          </>
        )}

        {isPaid && (
          <>
            <div
              className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
              style={{
                border: "1px solid #00FF66",
                color: "#00FF66",
                boxShadow: "0 0 40px rgba(0,255,102,0.4)",
              }}
            >
              <ShieldCheck size={40} strokeWidth={1.5} />
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00FF66] mb-3">
              Payment confirmed
            </div>
            <h1 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight mb-3">
              Welcome to the Sentinel Circle.
            </h1>
            <p className="text-white/65 font-mono text-sm mb-8">
              Your $4.99/mo rate is locked for life. Founder badge will appear in the bot the moment
              MYTHOS goes live for beta.
            </p>
          </>
        )}

        {isFail && (
          <>
            <div
              className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
              style={{
                border: "1px solid #FFB800",
                color: "#FFB800",
                boxShadow: "0 0 40px rgba(255,184,0,0.3)",
              }}
            >
              <ShieldAlert size={40} strokeWidth={1.5} />
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#FFB800] mb-3">
              {status.state === "no-session" ? "Missing session" : "Verification pending"}
            </div>
            <h1 className="font-display font-black text-white text-2xl md:text-3xl tracking-tight mb-3">
              We couldn't confirm your payment yet.
            </h1>
            <p className="text-white/60 font-mono text-sm mb-8">
              If you completed checkout, check your inbox for the Stripe receipt — your badge will
              still activate. Otherwise try again.
            </p>
          </>
        )}

        <Link
          to="/"
          className="btn-ghost inline-flex justify-center"
          data-testid="success-back-button"
        >
          <ArrowLeft size={16} /> Back to base
        </Link>
      </div>
    </div>
  );
}
