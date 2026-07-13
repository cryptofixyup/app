import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldHalf,
  LogOut,
  Loader2,
  Search,
  Users,
  DollarSign,
  Crown,
  MessageSquare,
  RefreshCw,
  Activity,
  Download,
} from "lucide-react";
import {
  fetchMetrics,
  fetchSignups,
  downloadSignupsCSV,
  me,
  clearToken,
  getToken,
} from "../../lib/adminApi";
import NoIndex from "../../components/NoIndex";

const PAGE_SIZE = 50;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [signups, setSignups] = useState({ total: 0, items: [], offset: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingSignups, setLoadingSignups] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/admin", { replace: true });
      return;
    }
    me()
      .then(setAdmin)
      .catch(() => navigate("/admin", { replace: true }));
  }, [navigate]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 280);
    return () => clearTimeout(t);
  }, [search]);

  const loadMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const m = await fetchMetrics();
      setMetrics(m);
    } catch {
      toast.error("Failed to load metrics.");
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadSignups = async (offset = 0) => {
    setLoadingSignups(true);
    try {
      const s = await fetchSignups({ search: debouncedSearch, limit: PAGE_SIZE, offset });
      setSignups({ ...s, offset });
    } catch {
      toast.error("Failed to load signups.");
    } finally {
      setLoadingSignups(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    loadSignups(0);
  }, [debouncedSearch]);

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadMetrics(), loadSignups(signups.offset)]);
    setRefreshing(false);
    toast.success("Refreshed.");
  };

  const logout = () => {
    clearToken();
    navigate("/admin", { replace: true });
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const filename = await downloadSignupsCSV({ search: debouncedSearch });
      toast.success(`Exported · ${filename}`);
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((signups.total || 0) / PAGE_SIZE));
  const currentPage = Math.floor((signups.offset || 0) / PAGE_SIZE) + 1;

  const conversionRate = useMemo(() => {
    if (!metrics) return "—";
    const total = metrics.total_signups || 0;
    const paid = metrics.revenue?.paid_subscriptions || 0;
    if (total === 0) return "0.0%";
    return ((paid / total) * 100).toFixed(1) + "%";
  }, [metrics]);

  return (
    <div className="min-h-screen relative" style={{ background: "#050505" }} data-testid="admin-dashboard">
      <NoIndex title="Founder console — Scam-Link Sentinel" />
      <div className="absolute inset-0 cyber-grid-fine opacity-25 pointer-events-none" />

      {/* Top bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10"
        style={{ background: "rgba(5,5,5,0.85)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldHalf
              size={22}
              style={{ color: "#00F0FF", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.6))" }}
            />
            <div>
              <div className="font-display font-black text-white text-sm tracking-tight">
                SENTINEL <span style={{ color: "#00F0FF" }}>//</span> CONTROL
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                {admin?.email || "—"} · session active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="btn-ghost"
              style={{ padding: "10px 14px", fontSize: 11 }}
              data-testid="admin-refresh-button"
            >
              {refreshing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>
            <button
              onClick={logout}
              className="btn-ghost"
              style={{ padding: "10px 14px", fontSize: 11 }}
              data-testid="admin-logout-button"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#00F0FF] mb-3">
          // OVERVIEW
        </div>
        <h1 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight mb-8">
          Founder console.
        </h1>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <MetricCard
            icon={Users}
            label="Total signups"
            value={metrics?.total_signups ?? 0}
            sub={`+${metrics?.by_category?.scam_link_sentinel ?? 0} Sentinel / +${metrics?.by_category?.mythos_guard ?? 0} Mythos`}
            color="#00F0FF"
            loading={loadingMetrics}
            testid="metric-total-signups"
          />
          <MetricCard
            icon={DollarSign}
            label="Revenue (paid)"
            value={`$${(metrics?.revenue?.total_paid_usd ?? 0).toFixed(2)}`}
            sub={`${metrics?.revenue?.paid_subscriptions ?? 0} paid · ${metrics?.revenue?.pending_subscriptions ?? 0} pending`}
            color="#00FF66"
            loading={loadingMetrics}
            testid="metric-revenue"
          />
          <MetricCard
            icon={Crown}
            label="Founding members"
            value={metrics?.revenue?.founding_members ?? 0}
            sub={`conversion · ${conversionRate}`}
            color="#7000FF"
            loading={loadingMetrics}
            testid="metric-founding"
          />
          <MetricCard
            icon={MessageSquare}
            label="Mythos Guard beta"
            value={metrics?.by_category?.mythos_guard ?? 0}
            sub="separate messaging waitlist"
            color="#FF007F"
            loading={loadingMetrics}
            testid="metric-mythos"
          />
        </div>

        {/* Category breakdown */}
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
          <BreakdownPanel metrics={metrics} loading={loadingMetrics} />
          <SourcePanel metrics={metrics} loading={loadingMetrics} />
        </div>

        {/* Signup table */}
        <div className="panel corners relative" data-testid="admin-signup-table-panel">
          <span className="tl"></span>
          <span className="tr"></span>

          <div className="px-5 md:px-7 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00F0FF]">
                // SIGNUP_FEED
              </div>
              <div className="font-display font-bold text-white text-lg tracking-tight">
                Waitlist · {signups.total} total
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search email…"
                  className="w-full bg-[#050505] border border-white/15 pl-9 pr-3 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF] font-mono text-xs transition-colors"
                  data-testid="admin-signup-search"
                />
              </div>
              <button
                onClick={exportCSV}
                disabled={exporting || signups.total === 0}
                className="csv-btn"
                data-testid="admin-export-csv-button"
                title={signups.total === 0 ? "Nothing to export" : "Download CSV of current filter"}
              >
                {exporting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                Download CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-left text-white/40 uppercase tracking-[0.18em] text-[10px]">
                  <Th>Email</Th>
                  <Th>Category</Th>
                  <Th>Source</Th>
                  <Th>Signed up</Th>
                  <Th>Payment</Th>
                </tr>
              </thead>
              <tbody>
                {loadingSignups && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/50">
                      <Loader2 size={18} className="inline animate-spin mr-2" /> loading…
                    </td>
                  </tr>
                )}
                {!loadingSignups && signups.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/40">
                      No signups match your filter.
                    </td>
                  </tr>
                )}
                {!loadingSignups &&
                  signups.items.map((s, i) => (
                    <tr
                      key={`${s.email}-${i}`}
                      className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                      data-testid={`admin-signup-row-${i}`}
                    >
                      <td className="px-5 md:px-7 py-3.5 text-white/90 break-all">
                        {s.email}
                        {s.founding_member && (
                          <span
                            className="ml-2 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                            style={{ color: "#7000FF", border: "1px solid #7000FF" }}
                          >
                            Founder
                          </span>
                        )}
                      </td>
                      <td className="px-5 md:px-7 py-3.5">
                        <CategoryBadge category={s.category} />
                      </td>
                      <td className="px-5 md:px-7 py-3.5 text-white/55 uppercase text-[10px] tracking-[0.18em]">
                        {s.source || "—"}
                      </td>
                      <td className="px-5 md:px-7 py-3.5 text-white/55 whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                      <td className="px-5 md:px-7 py-3.5">
                        <PaymentBadge status={s.payment_status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 md:px-7 py-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-white/40">
              page {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadSignups(Math.max(0, signups.offset - PAGE_SIZE))}
                disabled={signups.offset === 0 || loadingSignups}
                className="px-3 py-1.5 border border-white/15 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="admin-pagination-prev"
              >
                ← prev
              </button>
              <button
                onClick={() => loadSignups(signups.offset + PAGE_SIZE)}
                disabled={signups.offset + PAGE_SIZE >= signups.total || loadingSignups}
                className="px-3 py-1.5 border border-white/15 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="admin-pagination-next"
              >
                next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function MetricCard({ icon: Icon, label, value, sub, color, loading, testid }) {
  return (
    <div className="panel corners p-5 md:p-6 relative" data-testid={testid}>
      <span className="tl"></span>
      <span className="tr"></span>
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{
            border: `1px solid ${color}`,
            background: `${color}1f`,
            color,
            boxShadow: `0 0 18px ${color}33`,
          }}
        >
          <Icon size={16} strokeWidth={1.75} />
        </div>
        <Activity size={12} style={{ color: `${color}99` }} />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
        {label}
      </div>
      <div
        className="font-display font-black text-white text-3xl md:text-4xl tracking-tighter tabular-nums"
        style={{ color, textShadow: `0 0 16px ${color}55` }}
      >
        {loading ? "—" : value}
      </div>
      <div className="font-mono text-[10px] text-white/45 mt-2">{sub}</div>
    </div>
  );
}

function BreakdownPanel({ metrics, loading }) {
  const sentinel = metrics?.by_category?.scam_link_sentinel ?? 0;
  const mythos = metrics?.by_category?.mythos_guard ?? 0;
  const other = metrics?.by_category?.other ?? 0;
  const total = Math.max(1, sentinel + mythos + other);
  const rows = [
    { label: "Scam-Link Sentinel", value: sentinel, color: "#00F0FF" },
    { label: "Mythos Guard Beta", value: mythos, color: "#FF007F" },
    { label: "Other", value: other, color: "#7000FF" },
  ];

  return (
    <div className="panel corners p-6 relative" data-testid="admin-category-breakdown">
      <span className="tl"></span>
      <span className="tr"></span>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#00F0FF] mb-1">
        // CATEGORY_BREAKDOWN
      </div>
      <div className="font-display font-bold text-white text-lg tracking-tight mb-5">
        Where signups are coming from.
      </div>
      <div className="space-y-4">
        {rows.map((r) => {
          const pct = ((r.value / total) * 100).toFixed(1);
          return (
            <div key={r.label}>
              <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                <span className="text-white/75">{r.label}</span>
                <span className="text-white/85 tabular-nums">
                  {loading ? "—" : r.value}
                  <span className="text-white/35"> · {pct}%</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all"
                  style={{
                    width: `${pct}%`,
                    background: r.color,
                    boxShadow: `0 0 12px ${r.color}66`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SourcePanel({ metrics, loading }) {
  const sources = metrics?.by_source || {};
  const entries = Object.entries(sources).sort((a, b) => b[1] - a[1]);

  return (
    <div className="panel corners p-6 relative" data-testid="admin-source-breakdown">
      <span className="tl"></span>
      <span className="tr"></span>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF007F] mb-1">
        // SOURCE_STREAM
      </div>
      <div className="font-display font-bold text-white text-lg tracking-tight mb-5">
        Inbound by funnel.
      </div>
      {loading && (
        <div className="text-white/40 font-mono text-xs">loading…</div>
      )}
      {!loading && entries.length === 0 && (
        <div className="text-white/40 font-mono text-xs">No signups yet.</div>
      )}
      <ul className="space-y-2.5">
        {entries.map(([src, count]) => (
          <li
            key={src}
            className="flex items-center justify-between font-mono text-xs border-b border-white/5 pb-2.5 last:border-0"
          >
            <span className="text-white/65 uppercase tracking-[0.18em] text-[10px]">{src}</span>
            <span className="text-white tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 md:px-7 py-3 font-mono">{children}</th>;
}

function CategoryBadge({ category }) {
  const map = {
    scam_link_sentinel: { label: "Sentinel", color: "#00F0FF" },
    mythos_guard: { label: "Mythos Guard", color: "#FF007F" },
  };
  const c = map[category] || { label: "Other", color: "#7000FF" };
  return (
    <span
      className="px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] inline-block"
      style={{ color: c.color, border: `1px solid ${c.color}55`, background: `${c.color}10` }}
    >
      {c.label}
    </span>
  );
}

function PaymentBadge({ status }) {
  if (!status) {
    return <span className="text-white/35 text-[10px] uppercase tracking-[0.18em]">—</span>;
  }
  const map = {
    paid: { label: "Paid", color: "#00FF66" },
    initiated: { label: "Initiated", color: "#FFB800" },
    pending: { label: "Pending", color: "#FFB800" },
    failed: { label: "Failed", color: "#FF0033" },
    expired: { label: "Expired", color: "#FF0033" },
  };
  const c = map[status] || { label: status, color: "#A0A0B0" };
  return (
    <span
      className="px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] inline-block tabular-nums"
      style={{ color: c.color, border: `1px solid ${c.color}55` }}
    >
      {c.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
