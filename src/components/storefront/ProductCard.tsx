"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/utils";
import { ProductDetailModal } from "./ProductDetailModal";
import { toast } from "sonner";

export function TypeBadge({ type }: { type: string }) {
  const ready = type === "ready_to_ship";
  return (
    <span
      className={`inline-flex items-center rounded-full border-transparent px-3 py-1 text-xs font-semibold ${
        ready
          ? "bg-sage text-sage-foreground"
          : "bg-buttercup text-buttercup-foreground"
      }`}
    >
      {ready ? "Ready to Ship" : "Made to Order"}
    </span>
  );
}

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const cover = product.images?.[0];

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: cover
    });
    toast.success(`Added 1x ${product.title} to your bag! 🧶`);
  };

  return (
    <>
      <article 
        className="group flex flex-col overflow-hidden rounded-3xl border border-accent bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative block aspect-square overflow-hidden bg-muted">
          {cover && (
            <img
              src={cover}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span className="absolute left-3 top-3">
            <TypeBadge type={product.product_type} />
          </span>
          {product.images?.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur-sm">
              +{product.images.length - 1} photos
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
          <div>
            <h3 className="font-display text-base font-semibold text-berry group-hover:text-primary transition-colors">{product.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <div>
              <span className="font-display text-lg font-semibold text-foreground">
                {formatINR(product.price)}
              </span>
            </div>
            <button 
              onClick={handleOrder}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <ProductDetailModal 
          initialProduct={product} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}
