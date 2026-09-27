"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/utils";
import { ProductDetailModal } from "./ProductDetailModal";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";

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
  const { items, addItem, setQuantity, removeItem } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const cover = product.images?.[0] || product.image_url;

  // Check if item is already in cart
  const cartItem = items.find((i) => i.id === product.id);
  const qtyInBag = cartItem ? cartItem.quantity : 0;

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: cover,
    });
    toast.success(`Added 1x ${product.title} to your bag! 🧶`);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qtyInBag <= 1) {
      removeItem(product.id, cartItem?.selectedColor);
      toast.info(`Removed ${product.title} from bag`);
    } else {
      setQuantity(product.id, qtyInBag - 1, cartItem?.selectedColor);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(product.id, qtyInBag + 1, cartItem?.selectedColor);
  };

  return (
    <>
      <article
        className="group flex flex-col overflow-hidden rounded-3xl border border-accent bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative block aspect-square overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-semibold bg-alabaster">
              No image
            </div>
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
            <h3 className="font-display text-base font-semibold text-berry group-hover:text-primary transition-colors line-clamp-1">
              {product.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description || "Handcrafted with premium soft yarn in Bikaner, Rajasthan."}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-2.5">
            <div>
              <span className="font-display text-lg font-semibold text-foreground">
                {formatINR(product.price)}
              </span>
            </div>

            {/* Dynamic Button State */}
            {qtyInBag === 0 ? (
              <button
                type="button"
                onClick={handleOrder}
                className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between w-full rounded-xl bg-primary/10 border border-primary/20 p-1 transition-all animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="h-8 w-8 grid place-items-center rounded-lg bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-xs active:scale-95"
                  title="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <div className="flex flex-col items-center leading-none px-2">
                  <span className="font-display text-xs font-bold text-berry">
                    {qtyInBag} in bag
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleIncrease}
                  className="h-8 w-8 grid place-items-center rounded-lg bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-xs active:scale-95"
                  title="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
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
