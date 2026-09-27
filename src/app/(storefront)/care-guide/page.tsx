import Link from "next/link";
import { Sparkles, Droplets, Sun, Archive, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Care Guide | Crochet Corner",
  description: "Learn how to wash, dry, and preserve your handmade crochet creations so they last a lifetime.",
};

export default function CareGuidePage() {
  return (
    <div className="w-full py-10 sm:py-14 md:py-18">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-left">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Artisan Fabric Care
          </span>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-berry">
            Care Guide
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Every stitch is handcrafted with soft pastel yarn and requires gentle handling. Follow these simple guidelines to keep your bouquets, plushies, and wearables looking vibrant for years to come.
          </p>
        </div>

        {/* Content Cards Grid */}
        <div className="grid gap-6 sm:gap-8">
          {/* Card 1: Washing */}
          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Droplets className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Washing Instructions
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gentle cleansers protect yarn fibers from fraying or pilling.
                </p>

                <ul className="mt-5 space-y-3 text-sm text-foreground/85">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Hand Wash in Cold Water:</strong> Submerge your piece in cool water mixed with a small amount of mild baby shampoo or gentle liquid wool detergent.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Do Not Wring or Twist:</strong> Gently press and squeeze excess water out with both palms. Twisting or wringing will distort the stitches and stretch the shape.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Spot Clean When Possible:</strong> For minor dust or smudges on plushies and bouquets, dab gently with a damp cotton cloth. Never machine wash.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Drying */}
          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-buttercup/20 text-buttercup-foreground">
                <Sun className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Drying & Reshaping
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prevent stretching and preserve color richness.
                </p>

                <ul className="mt-5 space-y-3 text-sm text-foreground/85">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Always Lay Flat to Dry:</strong> Spread the damp item flat across a clean, dry towel in a well-ventilated room. Never hang crochet pieces — the weight of the water will stretch the yarn downward.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Reshape While Damp:</strong> Gently pat floral petals, hats, or plushie limbs back into their original proportions before allowing them to air dry completely.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Keep Out of Direct Scorching Sun:</strong> Dry in the shade. Direct harsh sunlight can fade delicate pastel shades over time.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Storage */}
          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/20 text-sage-foreground">
                <Archive className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Storage & Longevity
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Simple care habits to protect your pieces between uses.
                </p>

                <ul className="mt-5 space-y-3 text-sm text-foreground/85">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Fold, Never Hang Wearables:</strong> Store cardigans, beanies, and tote bags neatly folded in a drawer or shelf. Gravity will loosen hanging stitches over weeks.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Store in Breathable Pouches:</strong> When packing items away for seasons, place them in clean cotton or linen dust bags away from dampness.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <strong className="text-foreground">Avoid Friction with Zippers:</strong> Keep your crochet treasures away from rough Velcro, open metal zippers, or sharp jewelry that could snag individual loops.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support Callout */}
        <div className="mt-10 rounded-3xl bg-cream border border-accent/60 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="font-display text-lg font-bold text-berry">Have a question about a custom piece?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Feel free to message us with photos on WhatsApp for specific yarn or fabric questions.
            </p>
          </div>
          <Link
            href="/custom-orders"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors shrink-0"
          >
            <MessageCircle className="h-4 w-4" /> Custom Inquiries
          </Link>
        </div>
      </div>
    </div>
  );
}
