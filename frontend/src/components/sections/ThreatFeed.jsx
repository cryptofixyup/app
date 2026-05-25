import { useTranslation } from "react-i18next";
import { ShieldX } from "lucide-react";

export default function ThreatFeed() {
  const { t } = useTranslation();
  const items = t("categories.items", { returnObjects: true });
  const list = Array.isArray(items) ? items : [];

  return (
    <section
      id="threats"
      className="relative border-y border-white/10 bg-[#080809] py-3 overflow-hidden"
      data-testid="threat-feed"
    >
      <div className="flex items-center gap-0 overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 py-2 border-r border-white/10 shrink-0"
          style={{ background: "#050505" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#00F0FF", boxShadow: "0 0 10px #00F0FF" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00F0FF] font-bold">
            {t("categories.label")}
          </span>
        </div>

        <div className="flex-1 marquee-mask overflow-hidden">
          <div className="threat-track">
            {[...list, ...list].map((label, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 mx-6 font-mono text-xs whitespace-nowrap"
              >
                <ShieldX size={13} style={{ color: "#FF007F" }} />
                <span className="text-white/75">{label}</span>
                <span className="text-white/25">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .threat-track {
          display: inline-flex;
          animation: threat-scroll 32s linear infinite;
          white-space: nowrap;
        }
        @keyframes threat-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
