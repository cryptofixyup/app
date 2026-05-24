import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const FAQS = [
  {
    q: "What exactly does Scam-Link Sentinel scan for?",
    a: "Wallet drainers, typosquat domains, fake AI-investment dashboards, withdrawal-lock contracts, fake APY math, phishing kits, malicious mint pages, and Telegram impersonators. MYTHOS runs 1,247 heuristics plus 14 external threat feeds on every check.",
  },
  {
    q: "Do I have to connect my wallet?",
    a: "No. Ever. That's the point. Scam-Link Sentinel never asks for a wallet connection, seed phrase, or KYC. You forward a link, you get a verdict. Sovereignty first.",
  },
  {
    q: "How is this different from a normal URL checker?",
    a: "Generic checkers look at SSL and blacklists. We look at on-chain forensic signals, withdrawal-lock contract patterns, fake-APY math, and 'mind-virus' social-engineering schemas specifically engineered against crypto users.",
  },
  {
    q: "What does 'Founding Member' actually get me?",
    a: "Your $4.99/mo rate is locked for life — even when public pricing rises to $14.99. You get a founder badge in the bot, priority scan queue, vote on threat feed sources, MYTHOS API access, and entry into the private Sentinel Circle channel.",
  },
  {
    q: "When does the bot launch?",
    a: "Founding-member beta is rolling out in waves. Stripe subscribers get access first; waitlist users follow. Public launch follows once we clear 50,000 active users.",
  },
  {
    q: "Can I cancel?",
    a: "Yes — anytime, one click in Stripe. No retention dark patterns, no email hostage.",
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
