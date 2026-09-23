"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatINR, createCartCheckoutUrl } from "@/lib/whatsapp";
import { X, Minus, Plus, ShoppingBag, Gift, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, count, subtotal, giftUnlocked, remainingForGift, isOpen, setOpen, setQuantity, clearCart, settings } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setErrorMsg("");
  };

  const handlePlaceOrder = () => {
    if (
      !shipping.name.trim() ||
      !shipping.phone.trim() ||
      !shipping.address.trim() ||
      !shipping.city.trim() ||
      !shipping.pincode.trim()
    ) {
      setErrorMsg("Please fill in all shipping details before placing your order.");
      return;
    }

    const checkoutUrl = createCartCheckoutUrl(items, subtotal, giftUnlocked, settings, shipping);

    if (typeof window !== "undefined") {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }

    // Clear cart after placing order
    clearCart();
    toast.success("Order forwarded to WhatsApp! Your bag has been cleared. 🧶");
    handleClose();
  };

  const progressPercent = Math.min(100, (subtotal / settings.free_gift_threshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-cream shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          {step === 1 ? (
            <h2 className="font-serif text-2xl font-bold flex items-center gap-2 text-foreground">
              <ShoppingBag className="w-6 h-6 text-primary" /> My Bag ({count})
            </h2>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setStep(1); setErrorMsg(""); }}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted/70 hover:bg-muted text-foreground transition-colors mr-1"
                title="Back to items"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-primary" /> Shipping Details
              </h2>
            </div>
          )}
          <button 
            onClick={handleClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* STEP 1: CART REVIEW */}
        {step === 1 && (
          <>
            {/* Free Gift Promo */}
            {settings.is_free_gift_active && (
              <div className="bg-sage/10 p-5 border-b border-sage/20">
                {giftUnlocked ? (
                  <div className="flex items-center gap-3 text-sage-foreground">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-sage/20">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">🎉 Congratulations!</p>
                      <p className="text-xs font-medium">You unlocked a {settings.free_gift_title}!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-sage-foreground">
                      Add {formatINR(remainingForGift)} more to unlock a {settings.free_gift_title}! 🎁
                    </p>
                    <div className="h-2 w-full bg-sage/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sage transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="font-display text-lg">Your bag is empty</p>
                  <button 
                    onClick={handleClose}
                    className="text-primary font-semibold hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedColor || ''}`} className="flex gap-4 group">
                      <div className="relative h-24 w-20 overflow-hidden rounded-xl bg-muted shrink-0 border border-border/50">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-accent" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                          {item.selectedColor && (
                            <p className="text-xs text-muted-foreground mt-0.5">Color: {item.selectedColor}</p>
                          )}
                          <p className="font-semibold text-primary mt-1">{formatINR(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-1">
                            <button 
                              onClick={() => setQuantity(item.id, item.quantity - 1, item.selectedColor)}
                              className="grid h-9 w-9 place-items-center rounded bg-muted hover:bg-accent text-xs"
                            ><Minus className="w-3 h-3" /></button>
                            <span className="w-4 text-center font-semibold text-xs">{item.quantity}</span>
                            <button 
                              onClick={() => setQuantity(item.id, item.quantity + 1, item.selectedColor)}
                              className="grid h-9 w-9 place-items-center rounded bg-muted hover:bg-accent text-xs"
                            ><Plus className="w-3 h-3" /></button>
                          </div>
                          <button 
                            onClick={() => setQuantity(item.id, 0, item.selectedColor)}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Free Gift Fake Item */}
                  {settings.is_free_gift_active && giftUnlocked && (
                    <div className="flex gap-4 opacity-90 p-3 rounded-2xl bg-gradient-to-r from-sage/10 to-transparent border border-sage/20">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-sage/20 shrink-0 border border-sage/30 flex items-center justify-center">
                        <Gift className="w-8 h-8 text-sage" />
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <h3 className="font-semibold text-sm text-sage-foreground">🎁 {settings.free_gift_title}</h3>
                        <p className="text-xs text-sage-foreground/70 mt-1 font-medium bg-white/50 w-fit px-2 py-0.5 rounded-full">{settings.free_gift_value_label}</p>
                        <p className="font-semibold text-sage mt-2">₹0 <span className="line-through text-xs text-muted-foreground ml-1">{settings.free_gift_value_label.replace(/\D+/g, '')}</span></p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* STEP 2: SHIPPING DETAILS FORM */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="rounded-2xl bg-alabaster p-4 border border-border/60">
              <div className="flex justify-between items-center text-sm font-semibold text-foreground">
                <span>Order Summary</span>
                <span>{count} {count === 1 ? "item" : "items"}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                <span>Estimated Total</span>
                <span className="font-bold text-primary text-sm">{formatINR(subtotal)}</span>
              </div>
              {giftUnlocked && settings.is_free_gift_active && (
                <div className="mt-2 pt-2 border-t border-border/40 text-xs text-sage-foreground flex items-center gap-1.5 font-medium">
                  <Gift className="w-3.5 h-3.5 text-sage" /> Free Gift Unlocked: {settings.free_gift_title}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={shipping.name}
                onChange={(e) => { setShipping({ ...shipping, name: e.target.value }); setErrorMsg(""); }}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Phone / WhatsApp Number <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                required
                value={shipping.phone}
                onChange={(e) => { setShipping({ ...shipping, phone: e.target.value }); setErrorMsg(""); }}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Complete Street Address <span className="text-primary">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={shipping.address}
                onChange={(e) => { setShipping({ ...shipping, address: e.target.value }); setErrorMsg(""); }}
                placeholder="Flat / House No., Street, Colony"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  City <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shipping.city}
                  onChange={(e) => { setShipping({ ...shipping, city: e.target.value }); setErrorMsg(""); }}
                  placeholder="e.g. Bikaner"
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Pin Code <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shipping.pincode}
                  onChange={(e) => { setShipping({ ...shipping, pincode: e.target.value }); setErrorMsg(""); }}
                  placeholder="e.g. 334001"
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {items.length > 0 ? (
          <div className="border-t border-border/50 bg-card p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-8">
            {step === 1 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground/80">Estimated Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-foreground">{formatINR(subtotal)}</span>
                </div>
                {remainingForGift > 0 && settings.is_free_gift_active ? (
                  <span className="text-xs font-semibold text-sage-foreground bg-sage/10 px-3 py-1.5 rounded-full inline-block mb-4 border border-sage/20">
                    You're ₹{remainingForGift} away from a free gift!
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Proceed to Shipping Details &rarr;
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-4 text-base font-semibold text-whatsapp-foreground shadow-soft transition-all hover:bg-whatsapp/90 active:scale-[0.98]"
                >
                  Place Order on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMsg(""); }}
                  className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  &larr; Back to item review
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
