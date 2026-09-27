"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface CategoryModalProps {
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
  onClose: () => void;
  onSaved: () => void;
}

const isUUID = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export default function CategoryModal({
  category,
  onClose,
  onSaved,
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const formatSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const name = formData.name.trim();
    const slug = formatSlug(formData.slug || name);

    if (!name) {
      setErrorMsg("Category name is required.");
      setLoading(false);
      return;
    }

    if (!slug) {
      setErrorMsg("A valid URL slug is required.");
      setLoading(false);
      return;
    }

    try {
      const payload = { name, slug };

      // If category has a valid UUID, update it; otherwise insert as new
      if (category?.id && isUUID(category.id)) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([payload]);
        if (error) throw error;
      }

      // Purge ISR cache so storefront category lists update immediately
      await fetch("/api/revalidate", { method: "POST" }).catch(() => {});

      onSaved();
    } catch (err: any) {
      console.error("Error saving category:", err);
      let msg: string = err?.message || "Failed to save category.";
      if (
        msg.includes("schema cache") ||
        msg.includes("relation") ||
        msg.includes("does not exist")
      ) {
        msg =
          "The 'categories' table was not found in Supabase. Please ensure the migration SQL has been executed in your Supabase SQL editor and you have clicked 'Reload schema cache' in Settings -> API.";
      } else if (msg.includes("unique") || msg.includes("duplicate")) {
        msg = `A category with the slug "${slug}" already exists. Please choose a different slug.`;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-greige/50 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="font-serif text-2xl font-bold mb-6 text-charcoal">
          {category ? "Edit Category" : "Add New Category"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              placeholder="e.g. Handmade Totes"
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({
                  name: newName,
                  slug: category ? formData.slug : formatSlug(newName),
                });
              }}
              className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-charcoal placeholder:text-charcoal/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">
              Slug <span className="font-normal text-charcoal/50 text-xs">(URL friendly)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              placeholder="e.g. handmade-totes"
              onChange={(e) =>
                setFormData({ ...formData, slug: formatSlug(e.target.value) })
              }
              className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm text-charcoal placeholder:text-charcoal/40"
              required
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-greige/30">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? "Saving…" : category ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
