"use client";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeDrawer = () => setMobileOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <img
              src="/images/logo.jpg"
              alt="Crochet Corner Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-border/70 shadow-xs shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight leading-none text-berry group-hover:text-primary transition-colors">
                Crochet Corner
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 leading-none mt-1">
                Bikaner, Rajasthan
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
            <Link href="/shop" className="transition-colors hover:text-berry">Shop</Link>
            <Link href="/custom-orders" className="transition-colors hover:text-berry">Custom Orders</Link>
            <Link href="/care-guide" className="transition-colors hover:text-berry">Care Guide</Link>
            <Link href="/about" className="transition-colors hover:text-berry">About</Link>
            <Link href="/faq" className="transition-colors hover:text-berry">FAQ</Link>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent md:h-10 md:w-10"
            >
              <ShoppingBag className="h-5 w-5 md:h-4 md:w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={closeDrawer} 
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-background p-6 shadow-xl flex flex-col h-full border-l border-border/50">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" onClick={closeDrawer} className="flex items-center gap-2.5">
                <img
                  src="/images/logo.jpg"
                  alt="Crochet Corner Logo"
                  className="h-10 w-10 rounded-full object-cover border border-border/70 shrink-0"
                />
                <div className="flex flex-col justify-center">
                  <span className="font-display text-lg font-bold leading-none text-berry">
                    Crochet Corner
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 leading-none mt-1">
                    Bikaner, Rajasthan
                  </span>
                </div>
              </Link>
              <button 
                onClick={closeDrawer}
                className="grid h-11 w-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              <Link href="/shop" onClick={closeDrawer} className="flex h-11 items-center text-lg font-semibold transition-colors hover:text-berry">Shop</Link>
              <Link href="/custom-orders" onClick={closeDrawer} className="flex h-11 items-center text-lg font-semibold transition-colors hover:text-berry">Custom Orders</Link>
              <Link href="/care-guide" onClick={closeDrawer} className="flex h-11 items-center text-lg font-semibold transition-colors hover:text-berry">Care Guide</Link>
              <Link href="/about" onClick={closeDrawer} className="flex h-11 items-center text-lg font-semibold transition-colors hover:text-berry">About</Link>
              <Link href="/faq" onClick={closeDrawer} className="flex h-11 items-center text-lg font-semibold transition-colors hover:text-berry">FAQ</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
