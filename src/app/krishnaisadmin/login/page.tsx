"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const isPlaceholderSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

export const ADMIN_EMAIL = "hellocornercrochet@gmail.com";
export const ADMIN_PASSWORD = "q25o6DssgrtM7"; 

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    // Direct match against hardcoded admin credentials
    if (inputEmail === ADMIN_EMAIL.toLowerCase() && inputPassword === ADMIN_PASSWORD) {
      try {
        localStorage.setItem("cc-admin-authenticated", "true");
      } catch (e) {}
      router.push("/krishnaisadmin");
      return;
    }

    // If using placeholder Supabase keys and credentials didn't match
    if (isPlaceholderSupabase) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/krishnaisadmin");
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Crochet Corner</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Console</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-3xl border border-border/50 shadow-soft p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In to Admin"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            &larr; Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
