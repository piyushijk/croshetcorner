"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import ProductModal from "@/components/admin/ProductModal";
import CategoryModal from "@/components/admin/CategoryModal";
import { mockProducts, mockCategories } from "@/lib/mock-data";
import AuthGuard from "@/components/admin/AuthGuard";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<"catalog" | "categories" | "orders" | "settings">("catalog");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [prodRes, catRes, inqRes, setRes] = await Promise.all([
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at', { ascending: true }),
      supabase.from('custom_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('store_settings').select('*').limit(1).maybeSingle()
    ]);

    if (prodRes.error || !prodRes.data || prodRes.data.length === 0) {
      setProducts(mockProducts);
    } else {
      setProducts(prodRes.data);
    }
    if (catRes.error || !catRes.data || catRes.data.length === 0) {
      setCategories(mockCategories);
    } else {
      setCategories(catRes.data);
    }
    if (inqRes.data) setInquiries(inqRes.data);
    
    if (setRes.error || !setRes.data) {
      const savedMock = localStorage.getItem('cc-mock-settings');
      if (savedMock) {
        try {
          setSettings(JSON.parse(savedMock));
        } catch(e) {
          const { mockSettings } = await import("@/lib/mock-data");
          setSettings(mockSettings);
        }
      } else {
        const { mockSettings } = await import("@/lib/mock-data");
        setSettings(mockSettings);
      }
    } else {
      setSettings(setRes.data);
    }
    
    setLoading(false);
  };

  const handleToggleStock = async (p: any) => {
    // Optimistic UI
    setProducts(products.map(x => x.id === p.id ? { ...x, in_stock: !x.in_stock } : x));
    await supabase.from('products').update({ in_stock: !p.in_stock }).eq('id', p.id);
  };

  const handleToggleFeatured = async (p: any) => {
    setProducts(products.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x));
    await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? Products in this category will lose their association.")) {
      await supabase.from('categories').delete().eq('id', id);
      fetchData();
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    setInquiries(inquiries.map(x => x.id === id ? { ...x, status } : x));
    await supabase.from('custom_inquiries').update({ status }).eq('id', id);
  };

  if (loading) return <div className="p-20 text-center text-charcoal font-serif text-2xl">Loading Console...</div>;

  const inStockCount = products.filter(p => p.in_stock).length;
  const madeToOrderCount = products.filter(p => p.product_type === 'made_to_order').length;

  return (
    <AuthGuard>
    <div className="container mx-auto px-4 py-8 relative max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">Admin Console</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/")} size="sm">Storefront</Button>
          <Button variant="outline" size="sm" onClick={async () => { 
            try { localStorage.removeItem("cc-admin-authenticated"); } catch(e) {}
            await supabase.auth.signOut(); 
            router.push('/admin/login'); 
          }} className="text-red-500 hover:text-red-600 hover:bg-red-50">Sign Out</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-greige/50 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${activeTab === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-charcoal/50 hover:text-charcoal'}`}
        >
          Catalog & Inventory
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-charcoal/50 hover:text-charcoal'}`}
        >
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-charcoal/50 hover:text-charcoal'}`}
        >
          Custom Inquiries ({inquiries.filter(i => i.status === 'New').length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-charcoal/50 hover:text-charcoal'}`}
        >
          Store Settings
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-alabaster/50 p-4 rounded-2xl border border-greige/30">
            <div className="flex gap-6 text-sm">
              <div><span className="font-bold text-charcoal text-lg">{products.length}</span><br/><span className="text-charcoal/60">Total</span></div>
              <div><span className="font-bold text-green-700 text-lg">{inStockCount}</span><br/><span className="text-charcoal/60">In-Stock</span></div>
              <div><span className="font-bold text-charcoal text-lg">{madeToOrderCount}</span><br/><span className="text-charcoal/60">Made to Order</span></div>
            </div>
            <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-primary text-primary-foreground shrink-0">
              + Add New Product
            </Button>
          </div>

          {/* Products Grid/Table */}
          <div className="bg-white rounded-2xl border border-greige/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-greige/20 text-charcoal border-b border-greige/50">
                  <tr>
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Stock</th>
                    <th className="p-4 font-semibold">Featured</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-greige/20 last:border-0 hover:bg-alabaster/50">
                      <td className="p-4 flex items-center gap-3 min-w-[250px]">
                        <img src={p.images?.[0] || ""} alt="" className="w-12 h-12 rounded-lg object-cover border border-greige/30 bg-alabaster" />
                        <div>
                          <span className="font-bold text-charcoal block">{p.title}</span>
                          <span className="text-xs text-charcoal/60">{p.categories?.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-greige/30 text-charcoal uppercase tracking-wider">
                          {p.product_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-rosewood">₹{p.price}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleStock(p)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${p.in_stock ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                          {p.in_stock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleToggleFeatured(p)} className="text-xl hover:scale-110 transition-transform">
                          {p.featured ? "⭐" : "☆"}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-charcoal/60">No products found. Add your first product!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border/50">
            <div>
              <span className="font-bold text-lg">{categories.length}</span> <span className="text-muted-foreground text-sm">Categories</span>
            </div>
            <Button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="bg-primary text-primary-foreground shrink-0">
              + Add Category
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-foreground border-b border-border/50">
                  <tr>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Slug</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20">
                      <td className="p-4 font-bold text-foreground">{c.name}</td>
                      <td className="p-4 text-muted-foreground">{c.slug}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true); }}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-alabaster rounded-2xl border border-greige/50 text-charcoal/60">
              No custom inquiries yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="bg-white p-6 rounded-2xl border border-greige/50 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-charcoal text-lg">{inq.customer_name}</h3>
                    <select 
                      value={inq.status} 
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none ${inq.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' : inq.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                    >
                      <option value="New">New</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <span className="text-xs text-charcoal/40">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm text-charcoal/80 bg-alabaster p-3 rounded-xl border border-greige/30">
                    "{inq.idea_description}"
                  </p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="text-charcoal/60">🎨 <span className="font-medium text-charcoal">{inq.preferred_colors || 'N/A'}</span></span>
                    <span className="text-charcoal/60">📏 <span className="font-medium text-charcoal">{inq.estimated_size || 'N/A'}</span></span>
                    <span className="text-charcoal/60">📅 <span className="font-medium text-charcoal">{inq.target_date || 'Flexible'}</span></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  <span className="text-xs text-charcoal/50 text-center md:text-right font-medium">📞 {inq.phone}</span>
                  <a href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi ${inq.customer_name}, I'm reaching out from Crochet Corner regarding your custom inquiry!`} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="whatsapp" className="w-full">Chat on WhatsApp</Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-greige/50 shadow-sm max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">Shopping Bag Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-alabaster rounded-xl border border-border/50">
                <div>
                  <h3 className="font-semibold text-foreground">Enable Free Gift Promo</h3>
                  <p className="text-xs text-muted-foreground mt-1">Show the progress bar and unlock a gift at the threshold.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.is_free_gift_active} onChange={e => setSettings({...settings, is_free_gift_active: e.target.checked})} />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Trigger Threshold (₹)</label>
                <input 
                  type="number" 
                  value={settings.free_gift_threshold}
                  onChange={e => setSettings({...settings, free_gift_threshold: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-alabaster border border-greige/30 rounded-xl focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Cart subtotal required to unlock the gift.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Gift Display Title</label>
                <input 
                  type="text" 
                  value={settings.free_gift_title}
                  onChange={e => setSettings({...settings, free_gift_title: e.target.value})}
                  className="w-full p-3 bg-alabaster border border-greige/30 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Gift Value Label (Worth)</label>
                <input 
                  type="text" 
                  value={settings.free_gift_value_label}
                  onChange={e => setSettings({...settings, free_gift_value_label: e.target.value})}
                  className="w-full p-3 bg-alabaster border border-greige/30 rounded-xl focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">E.g. "Worth ₹400" or "Added by us — ₹0"</p>
              </div>

              <div className="pt-6 border-t border-border/50 flex gap-3 flex-col sm:flex-row">
                <Button 
                  type="button"
                  onClick={async () => {
                    if (settings.id === "1") {
                      // Mock mode fallback
                      localStorage.setItem('cc-mock-settings', JSON.stringify(settings));
                      alert("Settings saved locally in mock mode!");
                      window.dispatchEvent(new Event('store_settings_changed'));
                    } else {
                      let err;
                      if (settings.id) {
                        const { error } = await supabase.from('store_settings').update(settings).eq('id', settings.id);
                        err = error;
                      } else {
                        const { error } = await supabase.from('store_settings').insert([settings]);
                        err = error;
                      }
                      
                      if (err) {
                        alert("Error saving settings to database: " + err.message);
                        return;
                      }
                      alert("Settings saved successfully! They are now live on the storefront.");
                      window.dispatchEvent(new Event('store_settings_changed'));
                    }
                    fetchData();
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Save Settings
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fetchData()}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <CategoryModal 
          category={editingCategory} 
          onClose={() => setIsCategoryModalOpen(false)} 
          onSaved={() => {
            setIsCategoryModalOpen(false);
            fetchData();
          }} 
        />
      )}

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setIsModalOpen(false)} 
          onSaved={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      )}
    </div>
    </AuthGuard>
  );
}
