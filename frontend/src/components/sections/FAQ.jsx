import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../ui/accordion";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation();
  const FAQS = [1, 2, 3, 4, 5, 6].map((n) => ({ q: t(`faq.q${n}`), a: t(`faq.a${n}`) }));

  return (
    <section id="faq" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] mb-4">
            {t("faq.kicker")}
          </div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight">
            {t("faq.headline")}
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
