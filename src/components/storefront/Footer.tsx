import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const DEVELOPER_LINKEDIN_URL = "https://www.linkedin.com/in/piyush-prajapat-a208452b4/";

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-greige/20 border-t border-greige/50 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-berry mb-4">Crochet Corner</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
Stitched with love, made to keep. Artisan handmade crochet studio focusing on custom made pieces for unique gifting , cozy decoration and timeless crafts.          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link></li>
            <li><Link href="/custom-orders" className="hover:text-primary transition-colors">Custom Commissions</Link></li>
            <li><Link href="/care-guide" className="hover:text-primary transition-colors">Care Guide</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            <li>
              <a
                href={DEVELOPER_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary font-normal text-xs tracking-wider uppercase text-foreground/80 transition-colors inline-block"
              >
                Developer
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
          <div className="flex flex-col space-y-3 text-sm text-foreground/80">
            <a
              href="https://www.instagram.com/hellocornercrochet/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <InstagramIcon size={16} /> @hellocornercrochet
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61594397323447"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <FacebookIcon size={16} /> Facebook
            </a>
            <span className="flex items-center gap-2">
              <Mail size={16} /> hellocornercrochet@gmail.com
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Bikaner, Rajasthan, India
            </span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-6 border-t border-greige/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/60">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <span>&copy; {new Date().getFullYear()} Crochet Corner. All rights reserved.</span>
        </div>
        <p className="text-foreground/70 text-center sm:text-right">
          Want to make your own site?{" "}
          <a
            href={DEVELOPER_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-normal text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Click here &rarr;
          </a>
        </p>
      </div>
    </footer>
  );
}
