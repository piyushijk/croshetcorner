const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n', 'utf-8');
};

write('src/app/(storefront)/custom-orders/page.tsx', `
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateCustomOrderWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function CustomOrdersPage() {
  const [formData, setFormData] = useState({
    idea: "",
    colors: "",
    size: "",
    date: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const whatsappUrl = generateCustomOrderWhatsAppLink(
    formData.idea || "[Your Idea]", 
    formData.colors || "[Your Colors]", 
    formData.size || "[Size]", 
    formData.date || "[Date]"
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl font-bold mb-4">Commission a Piece</h1>
        <p className="text-foreground/70">
          Want something unique? Fill out the details below to generate a pre-filled WhatsApp message. We'll discuss feasibility and quote.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-pastel-sage/50 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold mb-2">What's your idea?</label>
            <textarea 
              name="idea"
              value={formData.idea}
              onChange={handleChange}
              placeholder="e.g. A crochet bucket hat with strawberry patterns..."
              className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-pastel-terracotta"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Preferred Colors</label>
            <input 
              type="text" 
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder="e.g. Sage green and cream"
              className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10 focus:outline-none focus:ring-2 focus:ring-pastel-terracotta" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Estimated Size/Qty</label>
              <input 
                type="text" 
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g. Adult Medium / 1 piece"
                className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10 focus:outline-none focus:ring-2 focus:ring-pastel-terracotta" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Target Date (Optional)</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10 focus:outline-none focus:ring-2 focus:ring-pastel-terracotta" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-pastel-sage/30 mt-6">
            <p className="text-sm text-center mb-4 text-foreground/60">
              Clicking below will open WhatsApp with your details. No payment is required to inquire.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button variant="whatsapp" size="lg" className="w-full gap-2">
                <MessageCircle /> Send Inquiry on WhatsApp
              </Button>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
`);

write('src/app/(storefront)/care-guide/page.tsx', `
export default function CareGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-center">Care Guide</h1>
      
      <div className="prose prose-lg prose-headings:font-serif prose-headings:text-pastel-terracotta mx-auto text-foreground/80">
        <p className="lead text-xl mb-8">
          Handmade crochet items are delicate and require special care to ensure they last a lifetime. Follow these guidelines to keep your pieces looking beautiful.
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">Washing Instructions</h3>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li><strong>Hand Wash Only:</strong> Submerge your item in cool water mixed with a small amount of mild baby shampoo or gentle wool detergent.</li>
          <li><strong>Do Not Wring:</strong> Gently squeeze the water out without twisting or wringing the yarn, which can ruin the shape.</li>
          <li><strong>Spot Clean:</strong> For small stains, dab gently with a damp cloth. Do not scrub.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">Drying & Shaping</h3>
        <ul className="list-disc pl-5 space-y-2 mb-8">
          <li><strong>Lay Flat to Dry:</strong> Always dry crochet items flat on a clean, dry towel. Hanging them will stretch the yarn out of shape.</li>
          <li><strong>Keep Out of Direct Sun:</strong> Drying in direct harsh sunlight can fade the beautiful pastel colors over time.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">Storage</h3>
        <p>
          Store your pieces folded in a breathable cotton bag or drawer. Avoid hanging wearables like cardigans or heavy bags, as gravity will stretch the stitches.
        </p>
      </div>
    </div>
  );
}
`);

write('src/app/admin/login/page.tsx', `
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl border border-pastel-sage/50 shadow-sm w-full max-w-md">
        <h1 className="font-serif text-2xl font-bold mb-6 text-center">Admin Console</h1>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-pastel-sage/50 rounded-xl p-3 bg-pastel-cream/10"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
`);

write('src/app/admin/dashboard/page.tsx', `
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push("/admin/login");
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const toggleStock = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    if (!error) fetchProducts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl font-bold">Inventory Management</h1>
        <Button variant="outline" onClick={handleLogout} size="sm">Logout</Button>
      </div>

      <div className="bg-white rounded-2xl border border-pastel-sage/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pastel-sage/20 text-foreground/80 border-b border-pastel-sage/50">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-pastel-sage/20 last:border-0 hover:bg-pastel-cream/20">
                  <td className="p-4 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0] || ""} alt="" className="w-10 h-10 rounded-md object-cover" />
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="p-4 text-foreground/70">{p.categories?.name}</td>
                  <td className="p-4">₹{p.price}</td>
                  <td className="p-4">
                    <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                      {p.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" onClick={() => toggleStock(p.id, p.in_stock)}>
                      Toggle Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`);
console.log('Setup script part 4 generated.');

