import Marquee from "react-fast-marquee";
import { ShieldX } from "lucide-react";

const ITEMS = [
  { url: "x-airdrop-claim.xyz/wallet-connect", type: "Wallet Drainer" },
  { url: "uniswpa-v4-launch.app/free-mint", type: "Typosquat" },
  { url: "ai-yield-bot.finance/auto-compound", type: "Fake APY" },
  { url: "metmask-support.help/kyc-verify", type: "Phishing" },
  { url: "elonx-x2-eth.live/double", type: "Giveaway Scam" },
  { url: "binance-promo-bonus.io/lock-period", type: "Withdrawal Lock" },
  { url: "openseaa-mint-pass.art/claim", type: "Fake Mint" },
  { url: "telegram-support-defi.bot/verify", type: "Social Eng." },
  { url: "compound-v4-airdrop.app/claim", type: "Wallet Drainer" },
  { url: "ledger-firmware-update.live/install", type: "Malware Drop" },
];

export default function ThreatFeed() {
  return (
    <section
      id="threats"
      className="relative border-y border-white/10 bg-[#080809] py-3"
      data-testid="threat-feed"
    >
      <div className="flex items-center">
        {/* Label */}
        <div
          className="flex items-center gap-3 px-5 py-2 border-r border-white/10 shrink-0"
          style={{ background: "#050505" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#FF0033", boxShadow: "0 0 10px #FF0033" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF0033] font-bold">
            LIVE THREATS
          </span>
        </div>

        {/* Marquee */}
        <div className="flex-1 marquee-mask">
          <Marquee speed={45} pauseOnHover gradient={false}>
            {ITEMS.concat(ITEMS).map((t, i) => (
              <div key={i} className="flex items-center gap-4 mx-8 font-mono text-xs">
                <ShieldX size={14} style={{ color: "#FF0033" }} />
                <span className="text-white/70 break-all">{t.url}</span>
                <span
                  className="px-2 py-0.5 border border-[#FF0033]/40 text-[#FF0033] text-[10px] uppercase tracking-[0.18em]"
                >
                  {t.type}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-white/40">BLOCKED</span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
