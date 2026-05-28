import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import API from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    /** Fetch the MongoDB profile using the current Supabase session token */
    const loadProfile = async () => {
      try {
        const { data } = await API.get('/auth/me');
        if (mounted) setUser(data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // 1. Hydrate from existing session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) loadProfile();
      else setLoading(false);
    });

    // 2. React to every auth event going forward
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        loadProfile();
      }
      // PASSWORD_RECOVERY is handled in ResetPassword page directly
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /** Merge partial updates into current user object (e.g. after profile edit) */
  const updateUser = (updates) =>
    setUser((prev) => (prev ? { ...prev, ...updates } : null));

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
