import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Toaster } from "sonner";

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
      <body className={`${inter.variable} ${merriweather.variable} font-sans min-h-screen flex flex-col overflow-x-hidden`}>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster position="bottom-center" toastOptions={{ className: 'font-sans' }} />
        </CartProvider>
      </body>
    </html>
  );
}
 