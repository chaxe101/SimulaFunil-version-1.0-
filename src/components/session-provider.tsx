"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event);

      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }

      // Se a sessão expirou, redireciona pro login
      if (!session && event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    // Tenta refresh da sessão ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.log("⚠️ Nenhuma sessão ativa encontrada");
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}