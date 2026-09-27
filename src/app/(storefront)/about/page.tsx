import Link from "next/link";
import { Sparkles, Heart, MapPin, Palette } from "lucide-react";

export const metadata = {
  title: "About Us | Crochet Corner",
  description: "Learn about Crochet Corner, an artisan handmade crochet studio based in Bikaner, Rajasthan.",
};

export default function AboutPage() {
  return (
    <div className="w-full py-10 sm:py-14 md:py-18">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-left">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <MapPin className="h-3.5 w-3.5" /> Bikaner, Rajasthan
          </span>
          <h1 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-berry">
            About Crochet Corner
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Stitched with love, made to keep. Discover our story and passion for slow, artisan handmade crafts.
          </p>
        </div>

        {/* Narrative Cards */}
        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Born in the City of Forts & Colors
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/80">
                  Welcome to Crochet Corner, nestled in the vibrant historic city of Bikaner, Rajasthan. 
                  Everything in our studio begins with a skein of soft pastel yarn, an ergonomic hook, and hours of patient craftsmanship. We believe in the timeless beauty of slow textiles in an age of mass production.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/30 text-secondary-foreground">
                <Palette className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Bespoke by Nature, Never Factory-Made
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/80">
                  From everlasting floral bouquets and daisy granny square tote bags to pocket-sized amigurumi plushies, each piece is either ready to ship or individually made to order. When you pick your colors, we customize every petal and border stitch specifically for you.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-accent bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage/20 text-sage-foreground">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-berry">
                  Gift-Ready & Sustainable
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/80">
                  Every order is packed like a present — eco-friendly wraps, satin ribbons, and personalized handwritten notes. When you shop here, you are directly supporting an independent artisan studio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl bg-cream border border-accent/60 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="font-display text-lg font-bold text-berry">Looking for something custom?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Explore our catalog or request a custom commission piece in your favorite palette.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              Browse Shop
            </Link>
            <Link
              href="/custom-orders"
              className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Custom Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
