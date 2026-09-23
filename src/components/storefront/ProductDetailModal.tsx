"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Clock, Heart, ShieldCheck } from "lucide-react";
import { formatINR, createProductOrderUrl } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { mockProducts } from "@/lib/mock-data";
import { toast } from "sonner";

export function ProductDetailModal({ initialProduct, onClose }: { initialProduct: any, onClose: () => void }) {
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    setImageIndex(0);
    setQuantity(1);
    
    // Fetch related products
    async function fetchRelated() {
      if (activeProduct.category_id || activeProduct.categories?.id) {
        const catId = activeProduct.category_id || (activeProduct.categories as any)?.id;
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('category_id', catId)
          .neq('id', activeProduct.id)
          .limit(4);
          
        if (!error && data && data.length > 0) {
          setRelated(data);
        } else {
          // Fallback
          const mockCatId = activeProduct.category_id || (activeProduct.categories as any)?.id;
          const relatedMocks = mockProducts.filter(p => 
            (p.category_id === mockCatId || (p.categories as any)?.id === mockCatId || p.categories?.slug === activeProduct.categories?.slug) 
            && p.id !== activeProduct.id
          ).slice(0, 4);
          setRelated(relatedMocks);
        }
      } else {
        const relatedMocks = mockProducts.filter(p => p.id !== activeProduct.id).slice(0, 4);
        setRelated(relatedMocks);
      }
    }
    fetchRelated();
  }, [activeProduct]);

  const handleNextImage = () => {
    if (activeProduct.images && imageIndex < activeProduct.images.length - 1) {
      setImageIndex(imageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
    }
  };

  const handleAdd = () => {
    addItem({
      id: activeProduct.id,
      title: activeProduct.title,
      price: activeProduct.price,
      quantity,
      image: activeProduct.images?.[0]
    });
    toast.success(`Added ${quantity}x ${activeProduct.title} to your bag! 🧶`);
    // Removed onClose() so the user can continue browsing
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const productUrl = `${baseUrl}/shop/${activeProduct.slug}`;
  const whatsappUrl = createProductOrderUrl(activeProduct.title, activeProduct.price, productUrl);

  const images = activeProduct.images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute right-6 top-6 sm:right-8 sm:top-8 z-[60] grid h-11 w-11 place-items-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md transition-colors hover:bg-accent"
      >
        <X className="h-5 w-5" />
      </button>
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-cream shadow-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 p-4 sm:p-6">
          {/* Left Column: Slider */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted border border-border/50 group">
              {images.length > 0 ? (
                <img 
                  src={images[imageIndex]} 
                  alt={activeProduct.title} 
                  className="h-full w-full object-cover transition-all"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    disabled={imageIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition-all disabled:opacity-0 hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    disabled={imageIndex === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition-all disabled:opacity-0 hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_: any, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${idx === imageIndex ? "w-6 bg-primary" : "w-2 bg-background/60 hover:bg-background"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Specs */}
          <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-0">
            <Badge className="w-fit mb-3 bg-sage text-sage-foreground">
              {activeProduct.product_type === 'ready_to_ship' ? 'Ready to Ship' : 'Made to Order'}
            </Badge>
            <h2 className="font-serif text-3xl font-bold text-foreground leading-tight">{activeProduct.title}</h2>
            <p className="text-2xl font-semibold text-rosewood mt-2 mb-4">{formatINR(activeProduct.price)}</p>
            
            <div className="prose prose-sm text-muted-foreground mb-6 line-clamp-4">
              <p>{activeProduct.description}</p>
            </div>

            <div className="space-y-4 mb-8 bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Lead Time</p>
                  <p className="text-sm text-muted-foreground">{activeProduct.product_type === 'ready_to_ship' ? 'In Stock (Dispatches in 24-48h)' : activeProduct.lead_time || 'Made to order (5-8 days)'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Care Instructions</p>
                  <p className="text-sm text-muted-foreground">{activeProduct.care_instructions || 'Gentle hand wash in cold water. Do not wring.'}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                <div className="flex items-center justify-between md:justify-start gap-3 rounded-xl border border-border bg-card p-1.5 h-14 w-full md:w-auto">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-10 w-10 place-items-center rounded-lg bg-muted hover:bg-accent"><span className="text-xl leading-none">-</span></button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="grid h-10 w-10 place-items-center rounded-lg bg-muted hover:bg-accent"><span className="text-xl leading-none">+</span></button>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleAdd}
                  className="flex-1 h-14 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full"
                >
                  <ShoppingBag className="h-5 w-5" /> Add to Bag
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Column: Related */}
        {related.length > 0 && (
          <div className="border-t border-border/60 bg-background/50 p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(rel => (
                <div 
                  key={rel.id} 
                  className="group cursor-pointer rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 transition-colors shadow-sm"
                  onClick={() => setActiveProduct(rel)}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img 
                      src={rel.images?.[0]} 
                      alt={rel.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{rel.title}</p>
                    <p className="text-sm text-primary font-semibold mt-1">{formatINR(rel.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
