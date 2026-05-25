import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const FAQS = [
  {
    q: "What exactly does Scam-Link Sentinel scan for?",
    a: "Wallet drainers, typosquat domains, fake AI-investment dashboards, withdrawal-lock contracts, fake APY math, phishing kits, malicious mint pages, and Telegram impersonators — every rule documented from a real scam we've investigated.",
  },
  {
    q: "Do I have to connect my wallet?",
    a: "No. Ever. That's the point. Scam-Link Sentinel never asks for a wallet connection, seed phrase, or KYC. You forward a link, you get a verdict. Sovereignty first.",
  },
  {
    q: "How is this different from a normal URL checker?",
    a: "Generic checkers look at SSL and blacklists. We look at on-chain heuristics, withdrawal-lock contract patterns, fake-APY math, and 'mind-virus' social-engineering schemas specifically engineered against crypto users.",
  },
  {
    q: "Is there a paid plan?",
    a: "Not yet. We're in private beta — no prices, no subscriptions, no \"founder tier\". When the bot opens, waitlist members get invites first. Any future pricing decisions happen after public launch and will be transparent.",
  },
  {
    q: "Who builds this?",
    a: "@CryptoFixYup — an independent investigator documenting active crypto scams. Every rule in MYTHOS comes from a real case. Contact details and the code repository are linked in the footer.",
  },
  {
    q: "When does the bot launch?",
    a: "We open in invite waves to waitlist members. No fixed date — we ship when the engine is honest about what it can and can't catch.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
            // FAQ
          </div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight">
            Questions, deconstructed.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3" data-testid="faq-accordion">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="panel corners border-white/10 px-5 data-[state=open]:border-[#00F0FF]/50"
              data-testid={`faq-item-${i}`}
            >
              <span className="tl"></span>
              <span className="tr"></span>
              <AccordionTrigger className="text-left font-display font-bold text-white text-base md:text-lg hover:no-underline hover:text-[#00F0FF] tracking-tight py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/65 font-mono text-sm leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
