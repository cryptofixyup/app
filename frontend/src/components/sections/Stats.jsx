import { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ITEMS = [
  { key: "scams_blocked", label: "Scams blocked", color: "#FF007F", suffix: "" },
  { key: "users_protected", label: "Users protected", color: "#00F0FF", suffix: "" },
  { key: "links_scanned", label: "Links scanned", color: "#00F0FF", suffix: "" },
  { key: "funds_saved_usd", label: "Funds saved", color: "#00FF66", prefix: "$", suffix: "+" },
];

function CountUp({ value, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(start + (value - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const formatted = n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 10_000
    ? `${(n / 1000).toFixed(0)}K`
    : n.toLocaleString();
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const [stats, setStats] = useState({
    scams_blocked: 184237,
    users_protected: 12408,
    links_scanned: 1283492,
    funds_saved_usd: 8400000,
  });

  useEffect(() => {
    axios.get(`${API}/stats`).then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <section className="relative py-20 md:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1300px] mx-auto">
        <div className="panel corners relative">
          <span className="tl"></span>
          <span className="tr"></span>
          <div className="absolute inset-0 cyber-grid-fine opacity-30 pointer-events-none" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
            {ITEMS.map((it) => (
              <div key={it.key} className="p-8 md:p-10" data-testid={`stat-${it.key}`}>
                <div
                  className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tighter glow-cyan"
                  style={{ color: it.color, textShadow: `0 0 24px ${it.color}66` }}
                >
                  <CountUp value={stats[it.key]} prefix={it.prefix} suffix={it.suffix} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mt-3">
                  {it.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
