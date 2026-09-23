"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function CategoryModal({ category, onClose, onSaved }: { category?: any, onClose: () => void, onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category?.id) {
        const { error } = await supabase.from('categories').update(formData).eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([formData]);
        if (error) throw error;
      }
      
      onSaved();
    } catch (error: any) {
      alert("Error saving category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border/50">
        <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">
          {category ? "Edit Category" : "Add New Category"}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  name,
                  // Auto-generate slug if it's a new category
                  slug: category ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                });
              }}
              className="w-full border border-border p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">Slug (URL friendly)</label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full border border-border p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/30">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading}>
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

