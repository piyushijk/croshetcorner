"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/whatsapp";

export default function AddToCartForm({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
      image: product.images?.[0]
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-border p-2">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-display text-lg font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          <Button 
            size="lg" 
            onClick={handleAdd}
            className="w-full gap-2 rounded-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-5 w-5" /> Add to Bag - {formatINR(product.price * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}

