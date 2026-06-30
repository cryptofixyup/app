import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Forward, Cpu, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation();

  const STEPS = [
    { n: "01", icon: Forward, color: "#00F0FF", title: t("how.s1_title"), desc: t("how.s1_desc") },
    { n: "02", icon: Cpu, color: "#FF007F", title: t("how.s2_title"), desc: t("how.s2_desc") },
    { n: "03", icon: ShieldCheck, color: "#00FF66", title: t("how.s3_title"), desc: t("how.s3_desc") },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
            {t("how.kicker")}
          </div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight">
            {t("how.headline")}
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-4">
          <div
            className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #00F0FF 20%, #FF007F 50%, #00FF66 80%, transparent 100%)",
              opacity: 0.5,
            }}
          />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center px-2"
              data-testid={`how-step-${s.n}`}
            >
              <div
                className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center"
                style={{
                  border: `1px solid ${s.color}`,
                  background: "#050505",
                  boxShadow: `0 0 40px ${s.color}33`,
                }}
              >
                <s.icon size={32} strokeWidth={1.5} style={{ color: s.color }} />
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] font-bold"
                  style={{ background: "#050505", color: s.color, border: `1px solid ${s.color}` }}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-2xl md:text-3xl mb-3 tracking-tight">
                {s.title}
              </h3>
              <p className="text-white/60 font-mono text-sm leading-relaxed max-w-xs mx-auto">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
