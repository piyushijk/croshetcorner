"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ProductModal({ product, categories, onClose, onSaved }: { product?: any, categories: any[], onClose: () => void, onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: product?.title || "",
    price: product?.price || "",
    category_id: product?.category_id || categories[0]?.id || "",
    product_type: product?.product_type || "ready_to_ship",
    description: product?.description || "",
    lead_time: product?.lead_time || "",
    care_instructions: product?.care_instructions || "",
    images: product?.images || []
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.publicUrl]
      }));

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        slug: product?.slug || generateSlug(formData.title)
      };

      if (product?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
      
      onSaved();
    } catch (error: any) {
      alert("Error saving product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-greige/50 max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-2xl font-bold mb-6 text-charcoal">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Images Section */}
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Product Images</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {formData.images.map((img: string, idx: number) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl border border-greige overflow-hidden">
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_: any, i: number) => i !== idx)}))}
                    className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-sm text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-greige flex flex-col items-center justify-center relative hover:bg-alabaster/50 transition-colors">
                <span className="text-2xl text-greige mb-1">+</span>
                <span className="text-xs font-semibold text-greige px-2 text-center text-charcoal/50">
                  {uploading ? "Uploading..." : "Upload"}
                </span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Price (₹)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Category</label>
              <select 
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                required
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Product Type</label>
              <select 
                value={formData.product_type}
                onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                required
              >
                <option value="ready_to_ship">Ready to Ship</option>
                <option value="made_to_order">Made to Order</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Lead Time (e.g. 5-7 days)</label>
              <input 
                type="text" 
                value={formData.lead_time}
                onChange={(e) => setFormData({...formData, lead_time: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Care Instructions</label>
              <input 
                type="text" 
                value={formData.care_instructions}
                onChange={(e) => setFormData({...formData, care_instructions: e.target.value})}
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-greige/30">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading || uploading}>
              {loading ? "Saving..." : (product ? "Save Changes" : "Publish Product")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

