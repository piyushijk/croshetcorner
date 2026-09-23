const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n', 'utf-8');
};

write('src/app/layout.tsx', `
import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather" });

export const metadata: Metadata = {
  title: "Crochet Corner | Stitched with love, made to keep.",
  description: "Artisan handmade crochet studio based in Bikaner, Rajasthan. Bespoke creations for gifting, personal accessories, and cozy home décor.",
  openGraph: {
    title: "Crochet Corner",
    description: "Stitched with love, made to keep.",
    url: "https://crochetcorner.com",
    siteName: "Crochet Corner",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={\`\${inter.variable} \${merriweather.variable} font-sans min-h-screen flex flex-col\`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
`);

write('src/components/ui/Button.tsx', `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-pastel-terracotta text-white hover:bg-opacity-90",
      outline: "border border-pastel-terracotta text-pastel-terracotta hover:bg-pastel-terracotta hover:text-white",
      ghost: "hover:bg-pastel-blush hover:text-foreground",
      whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E]",
    }
    const sizes = {
      default: "h-11 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-full px-8 text-lg",
      icon: "h-10 w-10",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
`);

write('src/components/ui/Badge.tsx', `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-pastel-sage bg-pastel-sage/30 px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors",
        className
      )}
      {...props}
    />
  )
}
export { Badge }
`);

write('src/components/storefront/Navbar.tsx', `
"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Shop", href: "/shop" },
    { name: "Custom Orders", href: "/custom-orders" },
    { name: "Care Guide", href: "/care-guide" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pastel-sage/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl text-pastel-terracotta font-bold tracking-tight">
          Crochet Corner
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-pastel-terracotta transition-colors">
              {link.name}
            </Link>
          ))}
          <Link href="/shop">
            <Button variant="default" size="sm" className="ml-4">Browse Catalog</Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-pastel-sage/50 bg-background absolute w-full left-0 top-16 shadow-lg">
          <nav className="flex flex-col p-4 space-y-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-lg font-medium text-foreground hover:text-pastel-terracotta">
                {link.name}
              </Link>
            ))}
            <Link href="/shop" onClick={() => setIsOpen(false)}>
              <Button variant="default" className="w-full mt-2">Browse Catalog</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
`);

write('src/components/storefront/Footer.tsx', `
import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-pastel-blush/20 border-t border-pastel-sage/50 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-pastel-terracotta mb-4">Crochet Corner</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Stitched with love, made to keep. Artisan handmade crochet studio focusing on bespoke creations for gifting, personal accessories, and cozy home décor.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link href="/shop" className="hover:text-pastel-terracotta">Catalog</Link></li>
            <li><Link href="/custom-orders" className="hover:text-pastel-terracotta">Custom Commissions</Link></li>
            <li><Link href="/care-guide" className="hover:text-pastel-terracotta">Care Guide</Link></li>
            <li><Link href="/admin/login" className="hover:text-pastel-terracotta">Admin Console</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Connect</h4>
          <div className="flex flex-col space-y-3 text-sm text-foreground/80">
            <span className="flex items-center gap-2"><MapPin size={16} /> Bikaner, Rajasthan, India</span>
            <span className="flex items-center gap-2"><Mail size={16} /> hello@crochetcorner.com</span>
            <Link href="#" className="flex items-center gap-2 hover:text-pastel-terracotta"><Instagram size={16} /> @crochetcorner_bkn</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 text-center text-xs text-foreground/50">
        &copy; {new Date().getFullYear()} Crochet Corner. All rights reserved.
      </div>
    </footer>
  );
}
`);

write('src/components/storefront/ProductCard.tsx', `
import Link from "next/link";
import { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={\`/shop/\${product.slug}\`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-pastel-sage/50 shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-[4/5] bg-pastel-cream/50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.images[0] || "https://images.unsplash.com/photo-1596431976077-6cb56e87d0c7?auto=format&fit=crop&q=80&w=400"} 
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {!product.in_stock && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-white text-pastel-terracotta border-pastel-terracotta">Made to Order</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
        <p className="text-sm text-foreground/70 mb-3">{product.categories?.name || 'Handmade'}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold text-pastel-terracotta">{formatINR(product.price)}</span>
          <div className="w-8 h-8 rounded-full bg-pastel-blush/30 flex items-center justify-center text-pastel-terracotta group-hover:bg-pastel-terracotta group-hover:text-white transition-colors">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
`);

