"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_ADMIN_AUTH === "true";
const isPlaceholderSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (BYPASS_AUTH) {
      setChecking(false);
      return;
    }

    // Support mock session for local testing when Supabase keys are placeholders or hardcoded admin is logged in
    try {
      const isMockLoggedIn = localStorage.getItem("cc-admin-authenticated") === "true";
      if (isMockLoggedIn) {
        setUser({ id: "admin", email: "hellocornercrochet@gmail.com" } as User);
        setChecking(false);
        return;
      }
    } catch (e) {}

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          router.replace("/admin/login");
        }
      } catch (e) {
        router.replace("/admin/login");
      }
      setChecking(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (!isPlaceholderSupabase) {
        router.replace("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!BYPASS_AUTH && !user) return null;

  return <>{children}</>;
}
