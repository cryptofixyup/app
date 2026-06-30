import { Send, Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const FEATURES = [
    {
      icon: Send,
      accent: "#00F0FF",
      accentSoft: "rgba(0, 240, 255, 0.15)",
      tag: "MODULE_01",
      title: t("features.m1_title"),
      body: t("features.m1_body"),
      bullets: [t("features.m1_b1"), t("features.m1_b2"), t("features.m1_b3")],
    },
    {
      icon: Lock,
      accent: "#FF007F",
      accentSoft: "rgba(255, 0, 127, 0.15)",
      tag: "MODULE_02",
      title: t("features.m2_title"),
      body: t("features.m2_body"),
      bullets: [t("features.m2_b1"), t("features.m2_b2"), t("features.m2_b3")],
    },
    {
      icon: Crown,
      accent: "#7000FF",
      accentSoft: "rgba(112, 0, 255, 0.18)",
      tag: "MODULE_03",
      title: t("features.m3_title"),
      body: t("features.m3_body"),
      bullets: [t("features.m3_b1"), t("features.m3_b2"), t("features.m3_b3")],
    },
  ];

  return (
    <section id="modules" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
        style={{ background: "linear-gradient(180deg, transparent, #00F0FF, transparent)" }}
      />
      <div className="max-w-[1300px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto] items-end gap-6 mb-14">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#FF007F] mb-4">
              {t("features.kicker")}
            </div>
            <h2 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {t("features.headline_l1")}
              <br />
              {t("features.headline_l2")}
            </h2>
          </div>
          <p className="text-white/60 font-mono text-sm max-w-md lg:text-right">
            {t("features.sub")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="panel corners p-7 relative overflow-hidden group"
              data-testid={`feature-card-${i + 1}`}
            >
              <span className="tl"></span>
              <span className="tr"></span>
              <div className="absolute inset-0 cyber-grid-fine opacity-40 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      border: `1px solid ${f.accent}`,
                      background: f.accentSoft,
                      color: f.accent,
                      boxShadow: `0 0 24px ${f.accent}33`,
                    }}
                  >
                    <f.icon size={22} strokeWidth={1.75} />
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: f.accent }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-white text-xl md:text-2xl mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed mb-6 font-mono">{f.body}</p>

                <ul className="space-y-2 pt-5 border-t border-white/10">
                  {f.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70"
                    >
                      <span
                        className="w-1.5 h-1.5"
                        style={{ background: f.accent, boxShadow: `0 0 6px ${f.accent}` }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
