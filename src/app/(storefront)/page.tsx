import Link from "next/link";
import { Sparkles, Truck, MessageCircle, Heart, Palette, Gift, Leaf } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createServerSupabase } from "@/lib/supabase/server";

export const revalidate = 60;

const categoryCards = [
  {
    slug: "florals",
    title: "Everlasting Florals",
    blurb: "Bouquets, tulips & sunflowers that never wilt",
    image: "/images/florals.jpg",
  },
  {
    slug: "wearables",
    title: "Wearables & Bags",
    blurb: "Granny square totes and pastel bucket hats",
    image: "/images/wearables.jpg",
  },
  {
    slug: "plushies",
    title: "Desk Buddies & Plushies",
    blurb: "Amigurumi friends and clip-on keychains",
    image: "/images/plushies.jpg",
  },
  {
    slug: "decor",
    title: "Cozy Home Décor",
    blurb: "Coasters, plant cradles and cushion covers",
    image: "/images/decor.jpg",
  },
];

const valueProps = [
  { icon: Heart, title: "100% handmade", text: "Every stitch is made by hand, never machine-made." },
  { icon: Palette, title: "Your colourway", text: "Pick your yarn shades and we will match them." },
  { icon: Gift, title: "Gift-ready packing", text: "Ecofriendly packaging, ribbon and a little note included." },
  { icon: Leaf, title: "Direct to artisan", text: "You are supporting a small Bikaner studio, not a factory." },
];

const steps = [
  { n: "01", title: "Browse & Pick", text: "Find a piece you love, or bring us your own idea." },
  { n: "02", title: "Chat on WhatsApp", text: "Confirm colours, size, delivery date and price." },
  { n: "03", title: "Stitched & Shipped", text: "We crochet it with care and post it to your door." },
];

const reviews = [
  {
    name: "Aditi, Jaipur",
    text: "The tulip bouquet looked even softer than the photos. My mum has it on her table all year.",
  },
  {
    name: "Rahul, Delhi",
    text: "Ordered a custom bee plushie for my girlfriend. They matched the colours perfectly.",
  },
  {
    name: "Sneha, Bikaner",
    text: "Loved how easy it was — one WhatsApp message and everything was sorted.",
  },
];

const faqs = [
  {
    q: "How long does an order take?",
    a: "Ready-to-ship pieces leave our studio within 24 hours. Made-to-order pieces usually take 5–7 working days, and larger custom projects 7–10 days.",
  },
  {
    q: "How do I pay?",
    a: "We confirm everything on WhatsApp. For custom work we ask for a 50% advance, and the balance before dispatch.",
  },
  {
    q: "How do I wash my crochet piece?",
    a: "Gentle hand wash in cold water, no wringing, then lay flat in shade to dry. Full details are in our care guide.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, we ship all over India. Share your pin code on WhatsApp and we'll confirm the delivery time and charges.",
  },
];

export default async function HomePage() {
  const supabase = createServerSupabase();
  let featured: any[] = [];
  let categories: any[] = [];
  
  try {
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select(`*, categories(id, name, slug)`)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase.from('categories').select('*').order('created_at', { ascending: true })
    ]);
      
    if (!prodRes.error && prodRes.data) {
      featured = prodRes.data;
    }

    if (!catRes.error && catRes.data) {
      categories = catRes.data;
    }
  } catch (e) {
    console.error("Failed to load homepage data:", e);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-wash">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-berry shadow-soft">
              <Sparkles className="h-3.5 w-3.5" /> Handmade in Bikaner, Rajasthan
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-berry text-balance-pretty sm:text-5xl">
              Stitched with love, made to keep.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Crochet bouquets that never wilt, granny square bags, tiny desk buddies and cosy
              décor - Everything made by hand, in the colours you choose.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Explore Collection
              </Link>
              <Link href="/custom-orders" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-input bg-background px-8 text-sm font-semibold hover:bg-accent hover:text-accent-foreground">
                Request Custom Order
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Ships across India
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> Order on WhatsApp, no checkout
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-4xl border border-accent bg-card shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="Pastel crochet flowers, yarn balls and a small plushie arranged on a cream surface"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-berry">Featured drops</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our most-loved pieces this season.
            </p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-primary hover:underline">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured?.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-berry">Shop by category</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c: any) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="group overflow-hidden rounded-3xl border border-accent bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift p-8 text-center flex flex-col items-center justify-center min-h-[140px]"
              >
                <h3 className="font-display text-xl font-semibold text-berry group-hover:text-primary transition-colors">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-berry">Why Crochet Corner?</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => (
            <div key={v.title} className="rounded-3xl bg-soft-panel p-6 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-berry">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-berry">
            How it works — 3 simple steps
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl border border-accent bg-card p-6 shadow-soft">
                <span className="font-display text-3xl font-bold text-primary">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-berry">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-berry">Customer Reviews</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.name}
              className="rounded-3xl border border-accent bg-card p-6 shadow-soft"
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">"{r.text}"</p>
              <footer className="mt-3 text-xs font-semibold text-muted-foreground">{r.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-berry">FAQs</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border/70">
              <AccordionTrigger className="text-left font-display text-base text-berry">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
