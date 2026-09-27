import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FAQs | Crochet Corner",
  description: "Frequently asked questions regarding shipping, custom commissions, care, and payments at Crochet Corner.",
};

const faqs = [
  {
    q: "How long does dispatch and shipping take?",
    a: "Ready-to-ship items are dispatched from Bikaner within 24-48 hours. Made-to-order items typically take 5-8 business days to craft with care before dispatch. Standard delivery across India takes 3-5 business days depending on your postal pin code.",
  },
  {
    q: "Do you take custom commissions?",
    a: "Yes! We specialize in custom orders. Visit our Custom Orders page to submit your color palette, reference photo, or idea. We confirm dimensions, yarn shades, and pricing directly on WhatsApp before starting your piece.",
  },
  {
    q: "How do I care for my crochet items?",
    a: "We recommend a gentle hand wash in cool water with mild baby shampoo or gentle wool wash. Never twist or wring the yarn. Lay completely flat on a clean dry towel to dry in the shade. Visit our dedicated Care Guide page for in-depth instructions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We process orders through WhatsApp for a warm, personalized artisan experience. We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM) and direct bank transfers.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, we ship to all pin codes across India. If you need international delivery for gifts or bulk wedding favors, please reach out directly on WhatsApp to calculate custom postage rates.",
  },
];

export default function FAQPage() {
  return (
    <div className="w-full py-10 sm:py-14 md:py-18">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-left">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <HelpCircle className="h-3.5 w-3.5" /> Help & Support
          </span>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-berry">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Everything you need to know about our crafting timeline, pan-India delivery, custom commissions, and payments.
          </p>
        </div>

        {/* Accordion Card */}
        <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/60 py-1">
                <AccordionTrigger className="text-left font-display text-base sm:text-lg font-semibold text-berry hover:text-primary transition-colors">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions */}
        <div className="mt-10 rounded-3xl bg-cream border border-accent/60 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="font-display text-lg font-bold text-berry">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              We're always happy to help you pick the right colors or custom sizing.
            </p>
          </div>
          <Link
            href="/custom-orders"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" /> Chat With Us
          </Link>
        </div>
      </div>
    </div>
  );
}
