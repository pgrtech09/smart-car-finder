"use client";
// Static export compatible auth callback
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow animate-pulse">
          <span className="text-3xl">🚗</span>
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Signing you in...</p>
      </div>
    </div>
  );
}
