"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import ProductModal from "@/components/admin/ProductModal";
import CategoryModal from "@/components/admin/CategoryModal";
import { mockSettings } from "@/lib/mock-data";
import AuthGuard from "@/components/admin/AuthGuard";

const isUUID = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<"catalog" | "categories" | "orders" | "settings">("catalog");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const triggerRevalidation = async () => {
    try {
      await fetch("/api/revalidate", { method: "POST" });
    } catch (e) {
      console.warn("Revalidation ping failed:", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [prodRes, catRes, inqRes, setRes] = await Promise.all([
        supabase.from("products").select("*, categories(*)").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("created_at", { ascending: true }),
        supabase.from("custom_inquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("store_settings").select("*").limit(1).maybeSingle(),
      ]);

      // Check if critical tables are missing or PostgREST schema cache is stale
      const hasMissingTable = [prodRes.error, catRes.error].some(
        (err) =>
          err &&
          (err.message.includes("schema cache") ||
            err.message.includes("relation") ||
            err.message.includes("does not exist"))
      );
      setDbReady(!hasMissingTable);

      // Handle products & categories directly from Supabase
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);

      // Handle custom inquiries
      if (inqRes.data) {
        setInquiries(inqRes.data);
      }

      // Handle store settings
      if (setRes.data) {
        setSettings(setRes.data);
      } else {
        try {
          const savedMock = localStorage.getItem("cc-mock-settings");
          setSettings(savedMock ? JSON.parse(savedMock) : mockSettings);
        } catch {
          setSettings(mockSettings);
        }
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setProducts([]);
      setCategories([]);
      setSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  // ─── Catalog Actions ────────────────────────────────────────────────────────
  const handleToggleStock = async (product: any) => {
    const newStock = !product.in_stock;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, in_stock: newStock } : p))
    );

    if (isUUID(product.id)) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ in_stock: newStock })
          .eq("id", product.id);
        if (error) throw error;
        await triggerRevalidation();
      } catch (err) {
        console.error("Failed to toggle stock:", err);
        // Revert on error
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, in_stock: product.in_stock } : p))
        );
        alert("Failed to update stock status in database.");
      }
    }
  };

  const handleToggleFeatured = async (product: any) => {
    const newFeatured = !product.featured;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, featured: newFeatured } : p))
    );

    if (isUUID(product.id)) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ featured: newFeatured })
          .eq("id", product.id);
        if (error) throw error;
        await triggerRevalidation();
      } catch (err) {
        console.error("Failed to toggle featured status:", err);
        // Revert on error
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: product.featured } : p))
        );
        alert("Failed to update featured flag in database.");
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) {
      return;
    }

    if (isUUID(id)) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        await triggerRevalidation();
      } catch (err: any) {
        alert("Error deleting product: " + (err?.message || "Unknown error"));
        return;
      }
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ─── Category Actions ───────────────────────────────────────────────────────
  const handleDeleteCategory = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? Products associated with it will become Uncategorized."
      )
    ) {
      return;
    }

    if (isUUID(id)) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        await triggerRevalidation();
      } catch (err: any) {
        alert("Error deleting category: " + (err?.message || "Unknown error"));
        return;
      }
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ─── Custom Inquiries ──────────────────────────────────────────────────────
  const updateInquiryStatus = async (id: string, status: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );

    if (isUUID(id)) {
      await supabase.from("custom_inquiries").update({ status }).eq("id", id);
    }
  };

  // ─── Store Settings Actions ────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsStatus(null);

    const payload = {
      free_gift_threshold: Number(settings.free_gift_threshold) || 1499,
      free_gift_title: settings.free_gift_title?.trim() || "Free Mystery Crochet Gift",
      free_gift_value_label: settings.free_gift_value_label?.trim() || "Worth ₹400",
      is_free_gift_active: Boolean(settings.is_free_gift_active),
      updated_at: new Date().toISOString(),
    };

    try {
      // Save locally as immediate backup
      try {
        localStorage.setItem("cc-mock-settings", JSON.stringify({ ...settings, ...payload }));
      } catch {}

      if (settings?.id && isUUID(settings.id)) {
        const { error } = await supabase
          .from("store_settings")
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("store_settings")
          .insert([payload])
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) setSettings(data);
      }

      // Notify CartProvider across browser tabs and purge ISR cache
      window.dispatchEvent(new Event("store_settings_changed"));
      await triggerRevalidation();

      setSettingsStatus({
        type: "success",
        message: "Shopping Bag promo settings saved and live on the storefront!",
      });
    } catch (err: any) {
      console.error("Error saving store settings:", err);
      setSettingsStatus({
        type: "error",
        message: `Saved locally, but failed to write to database: ${err?.message || "Unknown error"}`,
      });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-charcoal font-serif text-xl">Loading Admin Console…</p>
      </div>
    );
  }

  const inStockCount = products.filter((p) => p.in_stock).length;
  const madeToOrderCount = products.filter((p) => p.product_type === "made_to_order").length;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 relative max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">Admin Console</h1>
            <p className="text-xs text-charcoal/60 mt-1">Full control center for catalog, categories & settings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/")} size="sm">
              Storefront
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  localStorage.removeItem("cc-admin-authenticated");
                } catch {}
                await supabase.auth.signOut();
                router.push("/admin/login");
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Database Missing Warning Banner */}
        {!dbReady && (
          <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-base mb-1">
                  Database Schema Mismatch Detected
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  Your Supabase tables haven't been synchronized yet. Please run the setup script so that all products, categories, and storage buckets write directly to Supabase:
                </p>
                <ol className="text-xs sm:text-sm text-amber-900 space-y-1 list-decimal list-inside font-medium mb-3">
                  <li>
                    Open your{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold"
                    >
                      Supabase Dashboard
                    </a>
                  </li>
                  <li>
                    Go to <strong>SQL Editor → New Query</strong>
                  </li>
                  <li>
                    Copy and run the contents of{" "}
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                      database/migration_001.sql
                    </code>
                  </li>
                  <li>
                    Then go to <strong>Settings → API → Reload schema cache</strong>
                  </li>
                </ol>
                <Button size="sm" onClick={fetchData} className="bg-amber-700 hover:bg-amber-800 text-white text-xs">
                  Re-check Database Connection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-greige/50 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${
              activeTab === "catalog"
                ? "border-primary text-primary"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Catalog & Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Custom Inquiries ({inquiries.filter((i) => i.status === "New").length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 whitespace-nowrap font-semibold text-sm tracking-wide uppercase transition-colors border-b-2 ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Store Settings
          </button>
        </div>

        {/* ─── TAB 1: Catalog & Inventory ─────────────────────────────────── */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-alabaster/50 p-4 rounded-2xl border border-greige/30">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-charcoal text-lg">{products.length}</span>
                  <br />
                  <span className="text-charcoal/60 text-xs">Total Products</span>
                </div>
                <div>
                  <span className="font-bold text-green-700 text-lg">{inStockCount}</span>
                  <br />
                  <span className="text-charcoal/60 text-xs">In-Stock</span>
                </div>
                <div>
                  <span className="font-bold text-charcoal text-lg">{madeToOrderCount}</span>
                  <br />
                  <span className="text-charcoal/60 text-xs">Made to Order</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary text-primary-foreground shrink-0 font-semibold"
              >
                + Add New Product
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-greige/50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-greige/20 text-charcoal border-b border-greige/50">
                    <tr>
                      <th className="p-4 font-semibold">Product</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Stock Status</th>
                      <th className="p-4 font-semibold text-center">Featured</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-greige/20 last:border-0 hover:bg-alabaster/50 transition-colors"
                      >
                        <td className="p-4 flex items-center gap-3 min-w-[240px]">
                          <img
                            src={p.images?.[0] || "/images/florals.jpg"}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover border border-greige/30 bg-alabaster"
                          />
                          <div>
                            <span className="font-bold text-charcoal block line-clamp-1">{p.title}</span>
                            <span className="text-xs text-charcoal/60">
                              {p.categories?.name || "Uncategorized"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-greige/30 text-charcoal uppercase tracking-wider">
                            {(p.product_type || "ready_to_ship").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-rosewood">₹{p.price}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                              p.in_stock
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {p.in_stock ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className="text-xl hover:scale-125 transition-transform"
                            title="Toggle featured showcase"
                          >
                            {p.featured ? "⭐" : "☆"}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-charcoal/60">
                          No products found. Click "+ Add New Product" to populate your catalog!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Categories ─────────────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-greige/50 shadow-xs">
              <div>
                <span className="font-bold text-lg text-charcoal">{categories.length}</span>{" "}
                <span className="text-charcoal/60 text-sm">Categories active</span>
              </div>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="bg-primary text-primary-foreground font-semibold shrink-0"
              >
                + Add Category
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-greige/50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-greige/20 text-charcoal border-b border-greige/50">
                    <tr>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Slug (URL Segment)</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-greige/20 last:border-0 hover:bg-alabaster/50 transition-colors"
                      >
                        <td className="p-4 font-bold text-charcoal">{c.name}</td>
                        <td className="p-4 font-mono text-xs text-charcoal/70">{c.slug}</td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(c);
                              setIsCategoryModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(c.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-charcoal/60">
                          No categories defined. Click "+ Add Category" to create your first one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Custom Inquiries ───────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-greige/50 text-charcoal/60 shadow-xs">
                No custom inquiries received yet. When customers submit requests on /custom-orders, they will appear here.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white p-6 rounded-2xl border border-greige/50 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-charcoal text-lg">
                        {inq.name || inq.customer_name || "Customer"}
                      </h3>
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border focus:outline-none ${
                          inq.status === "New"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : inq.status === "Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="In Discussion">In Discussion</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <span className="text-xs text-charcoal/40">
                        {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <p className="text-sm text-charcoal/80 bg-alabaster p-3 rounded-xl border border-greige/30">
                      "{inq.idea_description}"
                    </p>

                    {inq.notes && (
                      <p className="text-xs text-charcoal/70 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
                        📍 <strong>Delivery / Notes:</strong> {inq.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-charcoal/60">
                      <span>
                        🎨 Colors: <strong className="text-charcoal">{inq.preferred_colors || "Flexible"}</strong>
                      </span>
                      <span>
                        📏 Size: <strong className="text-charcoal">{inq.estimated_size || "Standard"}</strong>
                      </span>
                      <span>
                        📅 Needed by: <strong className="text-charcoal">{inq.target_date || "Open"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                    <span className="text-xs text-charcoal/60 text-center md:text-right font-medium">
                      📞 {inq.phone}
                    </span>
                    <a
                      href={`https://wa.me/${(inq.phone || "").replace(/[^0-9]/g, "")}?text=Hi ${encodeURIComponent(
                        inq.name || inq.customer_name || "there"
                      )}, reaching out from Crochet Corner regarding your custom commission!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="whatsapp" className="w-full text-xs">
                        Open Chat on WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 4: Store Settings ─────────────────────────────────────── */}
        {activeTab === "settings" && settings && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-greige/50 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Shopping Bag Promo Settings</h2>
              <p className="text-xs text-charcoal/60 mb-6">
                Dynamic configuration for the Free Promotional Gift threshold & progress bar in the customer cart.
              </p>

              <div className="space-y-5">
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 bg-alabaster rounded-xl border border-greige/30">
                  <div>
                    <h3 className="font-semibold text-charcoal text-sm">Enable Free Gift Promotion</h3>
                    <p className="text-xs text-charcoal/60 mt-0.5">
                      Displays the unlock progress bar in the cart drawer.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(settings.is_free_gift_active)}
                      onChange={(e) =>
                        setSettings({ ...settings, is_free_gift_active: e.target.checked })
                      }
                    />
                    <div className="w-11 h-6 bg-greige/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                {/* Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">
                    Free Gift Subtotal Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={settings.free_gift_threshold}
                    onChange={(e) =>
                      setSettings({ ...settings, free_gift_threshold: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-3 bg-alabaster border border-greige/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-charcoal font-semibold"
                  />
                  <p className="text-xs text-charcoal/50 mt-1">
                    Minimum order subtotal needed before the gift is awarded.
                  </p>
                </div>

                {/* Gift Title */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">Gift Display Title</label>
                  <input
                    type="text"
                    value={settings.free_gift_title}
                    onChange={(e) => setSettings({ ...settings, free_gift_title: e.target.value })}
                    className="w-full p-3 bg-alabaster border border-greige/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-charcoal"
                  />
                </div>

                {/* Gift Value Label */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">
                    Gift Value Label (Displayed in Cart)
                  </label>
                  <input
                    type="text"
                    value={settings.free_gift_value_label}
                    placeholder='e.g. "Worth ₹400" or "Complimentary"'
                    onChange={(e) => setSettings({ ...settings, free_gift_value_label: e.target.value })}
                    className="w-full p-3 bg-alabaster border border-greige/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-charcoal"
                  />
                </div>

                {settingsStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold border ${
                      settingsStatus.type === "success"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {settingsStatus.message}
                  </div>
                )}

                <div className="pt-4 border-t border-greige/30 flex gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-primary text-primary-foreground font-semibold flex-1 sm:flex-none"
                  >
                    {savingSettings ? "Saving…" : "Save Settings"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchData}
                    disabled={savingSettings}
                    className="flex-1 sm:flex-none"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
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
