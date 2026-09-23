import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createProductOrderUrl } from "@/lib/whatsapp";
import { MessageCircle, Clock, Heart, ShieldCheck } from "lucide-react";

import { mockProducts } from "@/lib/mock-data";
import AddToCartForm from "@/components/storefront/AddToCartForm";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  let { data: product, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', params.slug)
    .single();

  if (error || !product) {
    product = mockProducts.find(p => p.slug === params.slug) as any;
  }

  if (!product) {
    notFound();
  }

  // Fallback to example.com in dev if VERCEL_URL is not set
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000';
  const productUrl = `${baseUrl}/shop/${product.slug}`;
  const whatsappUrl = createProductOrderUrl(product.title, product.price, productUrl);

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-alabaster rounded-3xl overflow-hidden border border-greige/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0] || "https://images.unsplash.com/photo-1596431976077-6cb56e87d0c7?auto=format&fit=crop&q=80&w=800"} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-alabaster border border-greige/30">
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
            <p className="text-2xl font-semibold text-rosewood mt-2">{formatINR(product.price)}</p>
          </div>
          
          <div className="prose prose-sm text-foreground/80 mb-8">
            <p>{product.description}</p>
          </div>

          <div className="space-y-4 mb-8 bg-greige/10 p-5 rounded-2xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-rosewood mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Lead Time</p>
                <p className="text-sm text-foreground/70">{product.in_stock ? 'In Stock (Dispatches in 24-48h)' : product.lead_time || 'Made to order (5-8 days)'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-rosewood mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Care Instructions</p>
                <p className="text-sm text-foreground/70">{product.care_instructions || 'Gentle hand wash in cold water using mild shampoo.'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
