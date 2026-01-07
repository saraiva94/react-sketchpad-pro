import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verifica localStorage para login simples de admin
  const checkLocalStorageAdmin = useCallback(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdmin(isLoggedIn);
    return isLoggedIn;
  }, []);

  useEffect(() => {
    // Primeiro verifica localStorage
    const localAdmin = checkLocalStorageAdmin();
    
    if (localAdmin) {
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer role check with setTimeout
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          // Verifica localStorage novamente
          checkLocalStorageAdmin();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    // Listen for localStorage changes (para sincronizar entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAdminLoggedIn") {
        checkLocalStorageAdmin();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkLocalStorageAdmin]);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Limpa localStorage
    localStorage.removeItem("isAdminLoggedIn");
    
    // Limpa todos os estados locais
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    
    // Também faz signOut do Supabase se houver sessão
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };
}
