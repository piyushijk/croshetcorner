import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-foreground text-center">Frequently Asked Questions</h1>
      
      <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold text-foreground">How long does shipping take?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Ready-to-ship items are dispatched within 24-48 hours. Made-to-order items typically take 5-8 days to craft before they are shipped. Standard delivery takes 3-5 business days depending on your location in India.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold text-foreground">Do you take custom commissions?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              Yes! We love bringing your unique ideas to life. Please visit the Custom Orders tab to submit a request. Keep in mind that custom slots are limited and may have a slightly longer lead time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold text-foreground">How do I wash my crochet items?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              We recommend a gentle hand wash in cold water using a mild baby shampoo or gentle detergent. Do not wring or twist. Lay flat to dry on a clean towel to maintain the shape. Please see our Care Guide for more details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-semibold text-foreground">What payment methods do you accept?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">
              We process all orders through WhatsApp to provide a personalized experience. We accept UPI (Google Pay, PhonePe, Paytm) and standard bank transfers.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

