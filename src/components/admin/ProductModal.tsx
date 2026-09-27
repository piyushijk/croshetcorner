"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface ProductModalProps {
  product?: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}

const isUUID = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export default function ProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Filter valid categories
  const validCategories = categories.filter((c) => c && c.id && c.name);
  const initialCategoryId =
    product?.category_id && isUUID(product.category_id)
      ? product.category_id
      : validCategories.find((c) => isUUID(c.id))?.id || "";

  const [formData, setFormData] = useState({
    title: product?.title || "",
    price: product?.price !== undefined ? String(product.price) : "",
    category_id: initialCategoryId,
    product_type: product?.product_type || "ready_to_ship",
    description: product?.description || "",
    lead_time: product?.lead_time || "",
    care_instructions: product?.care_instructions || "",
    images: Array.isArray(product?.images) ? product.images : [],
  });

  // ─── Image Upload Handler ──────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadError("");
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 8 * 1024 * 1024) {
        setUploadError("File size exceeds 8 MB limit.");
        return;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanName = file.name
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase()
        .slice(0, 20);
      const filePath = `product-${Date.now()}-${cleanName}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        console.error("Storage upload error:", uploadErr);
        if (
          uploadErr.message.toLowerCase().includes("bucket") ||
          uploadErr.message.toLowerCase().includes("not found")
        ) {
          setUploadError(
            'Bucket "product-images" not found. Please ensure migration_001.sql has been executed in your Supabase SQL editor.'
          );
        } else {
          setUploadError(`Upload failed: ${uploadErr.message}`);
        }
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.publicUrl],
        }));
      }
    } catch (err: any) {
      console.error("Unexpected upload error:", err);
      setUploadError(err?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddDirectUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setImageUrlInput("");
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // ─── Form Submission ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError("");

    const title = formData.title.trim();
    const priceNum = parseFloat(formData.price);

    if (!title) {
      setUploadError("Product title is required.");
      setLoading(false);
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setUploadError("Please provide a valid price.");
      setLoading(false);
      return;
    }

    try {
      // Determine slug (preserve existing slug if valid, otherwise generate)
      const slug =
        product?.slug &&
        product.slug !== "sample-product-1" &&
        product.slug !== "sample-product-2"
          ? product.slug
          : generateSlug(title);

      // Construct clean, explicit payload matching the products table
      // Note: Include both 'name' and 'title' to satisfy legacy database schemas that require 'name NOT NULL'
      const payload: Record<string, any> = {
        name: title,
        title,
        slug,
        price: priceNum,
        category_id: isUUID(formData.category_id) ? formData.category_id : null,
        product_type: formData.product_type || "ready_to_ship",
        description: formData.description.trim() || null,
        lead_time: formData.lead_time.trim() || null,
        care_instructions: formData.care_instructions.trim() || null,
        images: formData.images,
        image_url: formData.images[0] || null,
      };

      if (product?.id && isUUID(product.id)) {
        // UPDATE existing DB record
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        // INSERT new DB record (default in_stock and featured)
        payload.in_stock = product?.in_stock ?? true;
        payload.featured = product?.featured ?? false;
        
        let { error } = await supabase.from("products").insert([payload]);
        
        // If slug collision occurs, retry with a unique timestamp suffix
        if (error && (error.code === "23505" || error.message?.includes("slug"))) {
          payload.slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
          const retryRes = await supabase.from("products").insert([payload]);
          error = retryRes.error;
        }

        if (error) throw error;
      }

      // Purge storefront ISR cache so updates reflect instantly
      await fetch("/api/revalidate", { method: "POST" }).catch(() => {});

      onSaved();
    } catch (err: any) {
      console.warn("Product save notice:", err);
      let msg =
        err?.message ||
        err?.details ||
        err?.hint ||
        (typeof err === "object" ? JSON.stringify(err) : String(err)) ||
        "Failed to save product.";

      if (msg.includes("schema cache") || msg.includes("column")) {
        msg =
          "Database schema mismatch. Please run database/migration_001.sql in your Supabase SQL editor and reload the schema cache in Settings -> API.";
      } else if (msg.includes("not-null constraint") || msg.includes("null value")) {
        msg = `Missing required field: ${msg}`;
      }

      setUploadError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-greige/50 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <h2 className="font-serif text-2xl font-bold mb-6 text-charcoal">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Images Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-charcoal">
                Product Images
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-primary hover:underline font-semibold"
              >
                {showUrlInput ? "Hide URL input" : "+ Add image by URL"}
              </button>
            </div>

            {/* Direct Image URL input */}
            {showUrlInput && (
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or /images/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs border border-greige rounded-xl p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDirectUrl}
                  disabled={!imageUrlInput.trim()}
                >
                  Add URL
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-2">
              {formData.images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-greige overflow-hidden group shadow-xs"
                >
                  <img
                    src={img}
                    alt={`Product preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-xs transition-colors"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Upload box */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-dashed border-greige/80 hover:border-primary flex flex-col items-center justify-center relative hover:bg-alabaster/50 transition-colors cursor-pointer">
                <span className="text-xl sm:text-2xl text-greige mb-0.5">+</span>
                <span className="text-[10px] sm:text-xs font-semibold text-charcoal/60 px-1 text-center">
                  {uploading ? "Uploading…" : "Upload"}
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

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mt-2 text-xs text-red-700 font-medium">
                {uploadError}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                placeholder="e.g. Blossom Tulip Bouquet"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="1299"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category & Product Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              >
                <option value="">Uncategorized</option>
                {validCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Product Type
              </label>
              <select
                value={formData.product_type}
                onChange={(e) =>
                  setFormData({ ...formData, product_type: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              >
                <option value="ready_to_ship">Ready to Ship</option>
                <option value="made_to_order">Made to Order</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              placeholder="Describe yarn material, dimensions, styling notes..."
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none min-h-[90px]"
            />
          </div>

          {/* Lead Time & Care Instructions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Lead Time <span className="font-normal text-charcoal/50 text-xs">(e.g. 5-7 days)</span>
              </label>
              <input
                type="text"
                placeholder="Dispatches in 24-48h or 5-8 days"
                value={formData.lead_time}
                onChange={(e) =>
                  setFormData({ ...formData, lead_time: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                placeholder="Gentle hand wash in cold water"
                value={formData.care_instructions}
                onChange={(e) =>
                  setFormData({ ...formData, care_instructions: e.target.value })
                }
                className="w-full border border-greige p-2.5 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-greige/30">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold"
              disabled={loading || uploading}
            >
              {loading
                ? "Saving…"
                : product
                ? "Save Changes"
                : "Publish Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
