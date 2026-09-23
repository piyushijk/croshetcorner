"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createCustomOrderUrl } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function CustomOrdersPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(form);
    const idea = formData.get("idea") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const pincode = formData.get("pincode") as string;
    const colors = formData.get("colors") as string;
    const size = formData.get("size") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    try {
      await supabase.from('custom_inquiries').insert({
        idea_description: idea,
        name,
        phone,
        preferred_colors: colors,
        estimated_size: size,
        target_date: date || null,
        notes: address ? `Address: ${address}${pincode ? ` (Pin: ${pincode})` : ''}. ${notes || ''}` : notes,
      });
    } catch (err) {
      console.warn('Could not save inquiry to database:', err);
    }

    setSuccess(true);
    const whatsappUrl = createCustomOrderUrl({ idea, name, phone, address, pincode, colors, size, date, notes });
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
    form?.reset();
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl font-bold mb-4">Commission a Piece</h1>
        <p className="text-foreground/70">
          Want something unique? Fill out the details below to generate a pre-filled WhatsApp message. We'll discuss feasibility and quote.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-greige/50 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name <span className="text-primary">*</span></label>
              <input 
                type="text" 
                name="name"
                placeholder="Jane Doe"
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-primary"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone / WhatsApp <span className="text-primary">*</span></label>
              <input 
                type="tel" 
                name="phone"
                placeholder="+91 9876543210"
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-primary"
                required 
              />
            </div>
          </div>

          {/* Delivery Address & Pin Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-2">Delivery Address</label>
              <input 
                type="text" 
                name="address"
                placeholder="e.g., House No, Street Name, Near Temple"
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Pin Code</label>
              <input 
                type="text" 
                name="pincode"
                placeholder="e.g., 334001"
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">What's your idea?</label>
            <textarea 
              name="idea"
              
              placeholder="e.g. A crochet bucket hat with strawberry patterns..."
              className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-rosewood"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Preferred Colors</label>
            <input 
              type="text" 
              name="colors"
              
              placeholder="e.g. Sage green and cream"
              className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-rosewood" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Estimated Size/Qty</label>
              <input 
                type="text" 
                name="size"
                
                placeholder="e.g. Adult Medium / 1 piece"
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-rosewood" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Target Date (Optional)</label>
              <input 
                type="date" 
                name="date"
                
                className="w-full border border-greige/50 rounded-xl p-3 bg-alabaster/10 focus:outline-none focus:ring-2 focus:ring-rosewood" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-greige/30 mt-6">
            <p className="text-sm text-center mb-4 text-foreground/60">
              Clicking below will save your request and open WhatsApp.
            </p>
            <Button type="submit" disabled={loading} variant="whatsapp" size="lg" className="w-full gap-2">
              <MessageCircle /> {loading ? "Saving..." : "Send Inquiry on WhatsApp"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
