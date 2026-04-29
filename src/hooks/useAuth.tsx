import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentRoles, type Role } from "@/services/auth";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  roles: Role[];
  loading: boolean;
  isNgo: boolean;
  isEmployer: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  roles: [],
  loading: true,
  isNgo: false,
  isEmployer: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener FIRST, then initial fetch — recommended Supabase pattern.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer role fetch to avoid deadlocks inside the auth callback.
        setTimeout(() => {
          getCurrentRoles(s.user.id).then(setRoles);
        }, 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) getCurrentRoles(s.user.id).then(setRoles);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isNgo: roles.includes("ngo"),
        isEmployer: roles.includes("employer"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
