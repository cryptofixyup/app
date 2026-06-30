import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ScanLine, ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import { API } from "../../lib/api";

const EXAMPLES = [
  "uniswap.org/swap",
  "x-airdrop-claim.xyz/wallet-connect",
  "metmask-support.help/kyc-verify",
  "ai-yield-bot.finance/auto-compound",
];

export default function InteractiveDemo() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);

  const runScan = async (target) => {
    const value = (target ?? url).trim();
    if (!value) return;
    setUrl(value);
    setPhase("scanning");
    setResult(null);
    const fakeDelay = new Promise((r) => setTimeout(r, 1800));
    try {
      const [resp] = await Promise.all([axios.post(`${API}/scan`, { url: value }), fakeDelay]);
      setResult(resp.data);
      setPhase("result");
    } catch {
      setResult({
        verdict: "WARNING",
        risk_score: 50,
        threats: ["Scanner unreachable. Retry."],
        analysis: [],
        scanned_url: value,
      });
      setPhase("result");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setUrl("");
  };

  const verdictKey =
    result?.verdict === "SAFE" ? "verdict_safe" : result?.verdict === "DANGER" ? "verdict_danger" : "verdict_warning";
  const verdictColor =
    result?.verdict === "SAFE" ? "#00FF66" : result?.verdict === "DANGER" ? "#FF0033" : "#FFB800";
  const VerdictIcon =
    result?.verdict === "SAFE" ? ShieldCheck : result?.verdict === "DANGER" ? ShieldX : ShieldAlert;

  return (
    <section id="scanner" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
            {t("demo.kicker")}
          </div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl mb-4 tracking-tight">
            {t("demo.headline")}
          </h2>
          <p className="text-white/60 font-mono text-sm md:text-base max-w-2xl mx-auto">
            {t("demo.sub")}
          </p>
          <div
            className="mt-5 inline-block px-3 py-1.5 border border-[#FFB800]/40 bg-[#FFB800]/5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#FFB800] max-w-2xl"
            data-testid="scanner-disclaimer"
          >
            ⚠ {t("demo.disclaimer")}
          </div>
        </div>

        <div className="panel corners relative" data-testid="scanner-panel">
          <span className="tl"></span>
          <span className="tr"></span>

          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 font-mono text-[10px] uppercase tracking-[0.22em]">
            <div className="flex items-center gap-3 text-white/60">
              <span className="pulse-dot" />
              <span>{t("demo.header_left")}</span>
            </div>
            <div className="text-white/40 hidden sm:block">{t("demo.header_right")}</div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00F0FF] font-mono text-sm">&gt;</span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runScan(); }}
                  placeholder={t("demo.placeholder")}
                  className="w-full bg-[#050505] border border-white/10 pl-10 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors"
                  data-testid="scanner-input"
                  disabled={phase === "scanning"}
                />
              </div>
              {phase !== "result" ? (
                <button
                  className="btn-neon disabled:opacity-60"
                  onClick={() => runScan()}
                  disabled={phase === "scanning" || !url.trim()}
                  data-testid="scanner-submit-button"
                >
                  {phase === "scanning" ? (
                    <><Loader2 size={16} className="animate-spin" /> {t("demo.scan_loading")}</>
                  ) : (
                    <><ScanLine size={16} /> {t("demo.scan_button")}</>
                  )}
                </button>
              ) : (
                <button className="btn-ghost" onClick={reset} data-testid="scanner-reset-button">
                  {t("demo.scan_another")}
                </button>
              )}
            </div>

            {phase === "idle" && (
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-mono mr-2 self-center">
                  {t("demo.try_label")}
                </span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => runScan(ex)}
                    className="font-mono text-[11px] text-white/70 px-3 py-1.5 border border-white/10 hover:border-[#FF007F] hover:text-[#FF007F] transition-colors"
                    data-testid={`scanner-example-${ex}`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {phase === "scanning" && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 relative overflow-hidden border border-white/10 bg-[#050505] p-6"
                >
                  <div className="scan-line" />
                  <div className="font-mono text-xs text-white/60 space-y-2">
                    <ScanLog text={t("demo.log_init")} />
                    <ScanLog text={t("demo.log_whois")} delay={0.2} />
                    <ScanLog text={t("demo.log_feeds")} delay={0.5} />
                    <ScanLog text={t("demo.log_onchain")} delay={0.8} />
                    <ScanLog text={t("demo.log_lock")} delay={1.1} />
                    <ScanLog text={t("demo.log_verdict")} delay={1.4} accent />
                  </div>
                </motion.div>
              )}

              {phase === "result" && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8"
                  data-testid="scanner-result"
                >
                  <div
                    className="relative border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
                    style={{
                      borderColor: verdictColor,
                      boxShadow: `0 0 40px ${verdictColor}33`,
                      background: `linear-gradient(90deg, ${verdictColor}14 0%, transparent 70%)`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-20 h-20 shrink-0"
                      style={{ border: `1px solid ${verdictColor}`, color: verdictColor }}
                    >
                      <VerdictIcon size={42} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-display font-black text-3xl md:text-4xl tracking-tight"
                        style={{ color: verdictColor }}
                        data-testid="scanner-verdict"
                      >
                        {t(`demo.${verdictKey}`)}
                      </div>
                      <div className="font-mono text-xs text-white/50 mt-1 break-all">{result.scanned_url}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t("demo.risk_score")}
                      </div>
                      <div
                        className="font-display font-black text-4xl tabular-nums"
                        style={{ color: verdictColor }}
                      >
                        {result.risk_score}
                        <span className="text-white/30 text-2xl">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-white/10 p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#FF007F] mb-3">
                        {t("demo.threat_signals")}
                      </div>
                      {result.threats?.length ? (
                        <ul className="space-y-2 font-mono text-xs text-white/80">
                          {result.threats.map((th, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: "#FF0033" }}>×</span>
                              <span>{th}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="font-mono text-xs text-white/50">{t("demo.no_threats")}</div>
                      )}
                    </div>
                    <div className="border border-white/10 p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00F0FF] mb-3">
                        {t("demo.forensic_analysis")}
                      </div>
                      {result.analysis?.length ? (
                        <ul className="space-y-2 font-mono text-xs text-white/80">
                          {result.analysis.map((a, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: "#00F0FF" }}>›</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="font-mono text-xs text-white/50">{t("demo.no_signal")}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScanLog({ text, delay = 0, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{ color: accent ? "#00F0FF" : undefined }}
    >
      {text}
    </motion.div>
  );
}
