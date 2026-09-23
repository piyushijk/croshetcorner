const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n', 'utf-8');
};

write('src/app/(storefront)/page.tsx', `
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ProductCard from "@/components/storefront/ProductCard";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('featured', true)
    .limit(4);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="px-4 pt-16 pb-20 text-center bg-gradient-to-b from-pastel-blush/20 to-transparent">
        <div className="container mx-auto max-w-3xl">
          <Badge className="mb-6">Bikaner, Rajasthan</Badge>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Stitched with <span className="text-pastel-terracotta italic">love</span>, made to keep.
          </h1>
          <p className="text-lg text-foreground/80 mb-10 max-w-xl mx-auto">
            Bespoke handmade crochet creations for gifting, personal accessories, and cozy home décor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">Explore Catalog</Button>
            </Link>
            <Link href="/custom-orders">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Request Custom Order</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">Curated Drops</h2>
              <p className="text-foreground/70">Our most loved handmade pieces right now.</p>
            </div>
            <Link href="/shop" className="hidden sm:block text-pastel-terracotta hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link href="/shop" className="sm:hidden block mt-6 text-center text-pastel-terracotta font-medium border border-pastel-terracotta/30 py-3 rounded-xl">
            View All Products
          </Link>
        </section>
      )}

      {/* How it Works / Why Us */}
      <section className="bg-pastel-sage/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-pastel-blush rounded-full flex items-center justify-center mx-auto mb-4 text-xl">1</div>
              <h3 className="font-bold mb-2">Find Your Piece</h3>
              <p className="text-sm text-foreground/70">Browse our catalog or submit a custom reference for a bespoke piece.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-pastel-blush rounded-full flex items-center justify-center mx-auto mb-4 text-xl">2</div>
              <h3 className="font-bold mb-2">Chat on WhatsApp</h3>
              <p className="text-sm text-foreground/70">Click to order and we&apos;ll confirm stock, timeline, and payment via WhatsApp.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-pastel-blush rounded-full flex items-center justify-center mx-auto mb-4 text-xl">3</div>
              <h3 className="font-bold mb-2">Handcrafted & Shipped</h3>
              <p className="text-sm text-foreground/70">We craft it with love and ship it directly to you anywhere in India.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={\`inline-block px-3 py-1 bg-pastel-sage/30 border border-pastel-sage rounded-full text-xs font-semibold \${className || ''}\`}>{children}</span>
}
`);

write('src/app/(storefront)/shop/page.tsx', `
import { createServerSupabase } from "@/lib/supabase/server";
import ProductCard from "@/components/storefront/ProductCard";

export const revalidate = 60; // Revalidate every minute

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = createServerSupabase();
  
  // Fetch categories for pills
  const { data: categories } = await supabase.from('categories').select('*');
  
  // Fetch products based on category filter
  let query = supabase.from('products').select('*, categories(*)');
  if (searchParams.category && searchParams.category !== 'all') {
    query = query.eq('categories.slug', searchParams.category);
    // Note: In Supabase, filtering by a joined table requires a slightly different syntax or filtering post-fetch for inner joins.
    // For simplicity in MVP, we fetch all and filter in memory if the relation syntax is tricky.
  }
  
  const { data: allProducts } = await query.order('created_at', { ascending: false });
  
  // In-memory filter fallback for foreign key relation
  const products = searchParams.category && searchParams.category !== 'all' 
    ? allProducts?.filter(p => p.categories?.slug === searchParams.category)
    : allProducts;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-4xl font-bold mb-8">Catalog</h1>
      
      {/* Filters */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
        <a href="/shop?category=all" className={\`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors \${!searchParams.category || searchParams.category === 'all' ? 'bg-pastel-terracotta text-white border-pastel-terracotta' : 'bg-white border-pastel-sage/50 text-foreground hover:bg-pastel-sage/20'}\`}>
          All
        </a>
        {categories?.map(cat => (
          <a key={cat.id} href={\`/shop?category=\${cat.slug}\`} className={\`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors \${searchParams.category === cat.slug ? 'bg-pastel-terracotta text-white border-pastel-terracotta' : 'bg-white border-pastel-sage/50 text-foreground hover:bg-pastel-sage/20'}\`}>
            {cat.name}
          </a>
        ))}
      </div>

      {/* Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-pastel-sage/50">
          <p className="text-foreground/60">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
`);

write('src/app/(storefront)/shop/[slug]/page.tsx', `
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { generateProductWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle, Clock, Heart, ShieldCheck } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', params.slug)
    .single();

  if (!product) notFound();

  // We need absolute URL for WhatsApp message
  // Fallback to example.com in dev if VERCEL_URL is not set
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || \`https://\${process.env.VERCEL_URL}\` || 'http://localhost:3000';
  const productUrl = \`\${baseUrl}/shop/\${product.slug}\`;
  const whatsappUrl = generateProductWhatsAppLink(product.title, product.price, productUrl);

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-pastel-cream rounded-3xl overflow-hidden border border-pastel-sage/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0] || "https://images.unsplash.com/photo-1596431976077-6cb56e87d0c7?auto=format&fit=crop&q=80&w=800"} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-pastel-cream border border-pastel-sage/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col pt-4">
          <div className="mb-4">
            <Badge className="mb-2">{product.categories?.name || 'Crochet'}</Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">{product.title}</h1>
            <p className="text-2xl font-semibold text-pastel-terracotta mt-2">{formatINR(product.price)}</p>
          </div>
          
          <div className="prose prose-sm text-foreground/80 mb-8">
            <p>{product.description}</p>
          </div>

          <div className="space-y-4 mb-8 bg-pastel-sage/10 p-5 rounded-2xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-pastel-terracotta mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Lead Time</p>
                <p className="text-sm text-foreground/70">{product.in_stock ? 'In Stock (Dispatches in 24-48h)' : product.lead_time || 'Made to order (5-8 days)'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-pastel-terracotta mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Care Instructions</p>
                <p className="text-sm text-foreground/70">{product.care_instructions || 'Gentle hand wash in cold water using mild shampoo.'}</p>
              </div>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="whatsapp" size="lg" className="w-full gap-2 text-lg h-14">
                <MessageCircle /> Inquire on WhatsApp
              </Button>
            </a>
            <p className="text-xs text-center text-foreground/50 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> 1-on-1 personalized service. No payment needed yet.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-pastel-sage/50 z-40 pb-6">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="whatsapp" size="lg" className="w-full gap-2 shadow-lg">
            <MessageCircle /> Order on WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
`);
console.log('Setup script part 3 generated.');

