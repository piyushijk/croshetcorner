"use client";
import { MessageCircle } from "lucide-react";
import { formatINR } from "@/lib/whatsapp";

export function StickyOrderBar({
  label,
  price,
  href,
  onClick,
  cta = "Order via WhatsApp",
}: {
  label?: string;
  price?: number;
  href?: string;
  onClick?: () => void;
  cta?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-3">
        {price !== undefined ? (
          <div className="min-w-0">
            {label ? (
              <p className="truncate text-xs text-muted-foreground">{label}</p>
            ) : null}
            <p className="font-display text-lg font-semibold leading-tight text-berry">
              {formatINR(price)}
            </p>
          </div>
        ) : null}
        
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 text-base font-semibold text-whatsapp-foreground shadow-soft transition-all active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" /> {cta}
          </a>
        ) : (
          <button 
            onClick={onClick}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 text-base font-semibold text-whatsapp-foreground shadow-soft transition-all active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" /> {cta}
          </button>
        )}
      </div>
    </div>
  );
}

