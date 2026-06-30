import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  MessageSquare, Brain, Inbox, Loader2, ArrowRight,
  ShieldCheck, Sparkles, AlertOctagon,
} from "lucide-react";
import { API } from "../../lib/api";

export default function MythosGuard() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const FEATURES = [
    { icon: MessageSquare, accent: "#00F0FF", tag: "MG_01", title: t("mythos.f1_title"), sub: t("mythos.f1_sub"), body: t("mythos.f1_body") },
    { icon: Brain,         accent: "#FF007F", tag: "MG_02", title: t("mythos.f2_title"), sub: t("mythos.f2_sub"), body: t("mythos.f2_body") },
    { icon: Inbox,         accent: "#7000FF", tag: "MG_03", title: t("mythos.f3_title"), sub: t("mythos.f3_sub"), body: t("mythos.f3_body") },
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { toast.error(t("toasts.mythos_invalid")); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, { email, source: "mythos_guard_beta" });
      toast.success(t("toasts.wl_success_mythos"));
      setEmail("");
    } catch { toast.error(t("toasts.wl_fail")); }
    finally { setLoading(false); }
  };

  return (
    <section id="mythos-guard" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none" />
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(112,0,255,0.14) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,240,255,0.14) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div className="relative max-w-[1300px] mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-end mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 border border-[#00F0FF]/40 bg-[#00F0FF]/5">
              <Sparkles size={12} style={{ color: "#00F0FF" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00F0FF]">
                {t("mythos.pill")}
              </span>
            </div>
            <h2 className="font-display font-black text-white text-4xl md:text-5xl lg:text-6xl leading-[1.0] tracking-tighter">
              {t("mythos.headline_l1")}<br />
              <span className="text-white/70">{t("mythos.headline_l2")}</span><br />
              <span style={{ color: "#00F0FF" }} className="glow-cyan">{t("mythos.headline_l3")}</span>
            </h2>
          </div>
          <p className="text-white/65 font-mono text-base md:text-lg leading-relaxed lg:pb-4">
            {t("mythos.sub_pre")}
            <span className="text-white">{t("mythos.sub_emph")}</span>
            {t("mythos.sub_mid")}
            <span style={{ color: "#FF007F" }} className="font-bold">{t("mythos.sub_mindvirus")}</span>
            {t("mythos.sub_post")}
          </p>
        </div>

        <PipelineSchematic />

        <div className="grid md:grid-cols-3 gap-5 mt-16">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="panel corners p-7 relative overflow-hidden"
              data-testid={`mythos-feature-${i + 1}`}
            >
              <span className="tl"></span><span className="tr"></span>
              <div className="absolute inset-0 cyber-grid-fine opacity-30 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      border: `1px solid ${f.accent}`, background: `${f.accent}1f`,
                      color: f.accent, boxShadow: `0 0 24px ${f.accent}44`,
                    }}
                  >
                    <f.icon size={22} strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: f.accent }}>
                    {f.tag}
                  </span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">{f.sub}</div>
                <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-3 tracking-tight">{f.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed font-mono">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 panel corners p-8 md:p-10 relative" data-testid="mythos-beta-cta">
          <span className="tl"></span><span className="tr"></span>
          <div className="absolute inset-0 cyber-grid-fine opacity-30 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00F0FF] mb-3">
                {t("mythos.cta_kicker")}
              </div>
              <h3 className="font-display font-black text-white text-2xl md:text-3xl tracking-tight leading-[1.15] mb-2">
                {t("mythos.cta_headline")}
              </h3>
              <p className="text-white/55 font-mono text-sm">{t("mythos.cta_sub")}</p>
            </div>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3" data-testid="mythos-beta-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("mythos.cta_placeholder")}
                className="flex-1 bg-[#050505] border border-white/15 px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] font-mono text-sm transition-colors"
                data-testid="mythos-beta-email-input"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-neon disabled:opacity-60"
                data-testid="mythos-beta-submit-button"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {t("mythos.cta_button")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineSchematic() {
  const { t } = useTranslation();
  return (
    <div className="relative panel corners p-6 md:p-10 overflow-hidden" data-testid="mythos-pipeline">
      <span className="tl"></span><span className="tr"></span>
      <div className="absolute inset-0 cyber-grid-fine opacity-40 pointer-events-none" />

      <div className="relative grid lg:grid-cols-[1fr_auto_1.05fr_auto_1fr] gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <NodeLabel color="#FF0033" tag={t("mythos.pipe_input")}>
            <AlertOctagon size={11} />
          </NodeLabel>
          <div
            className="border border-[#FF0033]/40 bg-[#FF0033]/5 p-4 font-mono text-xs space-y-2"
            style={{ boxShadow: "0 0 30px rgba(255,0,51,0.12)" }}
          >
            <div className="flex items-center gap-2 text-white/40 text-[10px]">
              <span>+1 (415) 555-0XXX</span>
              <span className="ml-auto">{t("mythos.pipe_msg_time")}</span>
            </div>
            <div className="text-white/85 leading-relaxed">
              <span className="text-[#FF0033]">⚠</span> {t("mythos.pipe_msg_body")}
              <br />
              <span className="text-[#FF007F] underline break-all">metmask-support.help/kyc-verify</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Tag color="#FF0033">{t("mythos.pipe_msg_tag_fomo")}</Tag>
              <Tag color="#FF0033">{t("mythos.pipe_msg_tag_urgency")}</Tag>
              <Tag color="#FF0033">{t("mythos.pipe_msg_tag_typo")}</Tag>
              <Tag color="#FF0033">{t("mythos.pipe_msg_tag_drainer")}</Tag>
            </div>
          </div>
        </motion.div>

        <SchematicArrow />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          <NodeLabel color="#00F0FF" tag={t("mythos.pipe_engine")}>
            <Brain size={11} />
          </NodeLabel>
          <div
            className="relative border border-[#00F0FF]/50 bg-[#050505] p-5 overflow-hidden"
            style={{ boxShadow: "0 0 40px rgba(0,240,255,0.25)" }}
          >
            <div className="scan-line" />
            <div className="font-mono text-[11px] space-y-2">
              <PipelineLog text={t("mythos.pipe_log_parse")} color="#00F0FF" />
              <PipelineLog text={t("mythos.pipe_log_flag")} color="#FF007F" delay={0.15} />
              <PipelineLog text={t("mythos.pipe_log_domain")} color="#FF0033" delay={0.3} />
              <PipelineLog text={t("mythos.pipe_log_deepfake")} color="#00FF66" delay={0.45} />
              <PipelineLog text={t("mythos.pipe_log_bias")} color="#00F0FF" delay={0.6} />
              <PipelineLog text={t("mythos.pipe_log_quar")} color="#00F0FF" delay={0.75} />
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
              <span className="text-white/40">status</span>
              <span className="text-[#00F0FF]">beta</span>
            </div>
          </div>
        </motion.div>

        <SchematicArrow />

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <NodeLabel color="#00FF66" tag={t("mythos.pipe_output")}>
            <ShieldCheck size={11} />
          </NodeLabel>
          <div
            className="border border-[#00FF66]/50 bg-[#00FF66]/5 p-4 font-mono text-xs space-y-2"
            style={{ boxShadow: "0 0 30px rgba(0,255,102,0.15)" }}
          >
            <div className="flex items-center gap-2 text-white/40 text-[10px]">
              <span>{t("mythos.pipe_out_status")}</span>
              <span className="ml-auto">{t("mythos.pipe_out_scanned")}</span>
            </div>
            <div className="text-white/85 leading-relaxed">
              <span className="text-[#00FF66]">✓</span> {t("mythos.pipe_out_body")}
              <br />
              <span className="text-white/40">{t("mythos.pipe_out_noaction")}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Tag color="#00FF66">{t("mythos.pipe_out_tag_safe")}</Tag>
              <Tag color="#00FF66">{t("mythos.pipe_out_tag_decon")}</Tag>
              <Tag color="#00FF66">{t("mythos.pipe_out_tag_deliv")}</Tag>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function NodeLabel({ color, tag, children }) {
  return (
    <div
      className="inline-flex items-center gap-2 mb-3 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] font-bold"
      style={{ color, border: `1px solid ${color}66`, background: "#050505" }}
    >
      {children}
      <span>{tag}</span>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5"
      style={{ color, border: `1px solid ${color}66` }}
    >
      {children}
    </span>
  );
}

function PipelineLog({ text, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      style={{ color: color || "#A0A0B0" }}
    >
      {text}
    </motion.div>
  );
}

function SchematicArrow() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div
        className="w-14 h-px relative"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.05), #00F0FF 50%, rgba(255,255,255,0.05))",
        }}
      >
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0"
          style={{
            borderLeft: "8px solid #00F0FF",
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            filter: "drop-shadow(0 0 4px #00F0FF)",
          }}
        />
      </div>
    </div>
  );
}
