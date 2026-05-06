import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthUser } from '@/services/userStore';
import { getStoredAuthUser, setStoredAuthUser } from '@/services/userStore';
import { getApiBaseUrl } from '@/services/apiBaseUrl';

type AuthContextValue = {
  user: AuthUser | null;
  isHydrating: boolean;
  setUser: (user: AuthUser | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Backend session verification ──────────────────────────────────────────────
// Returns true  → session is valid, keep user logged in.
// Returns false → user doesn't exist on the backend (e.g. DB was wiped after
//                 a restart); clear the local session and force login.
// Network errors / timeouts → return true (graceful degradation — don't lock
// the user out just because they're offline or the server is slow).
async function verifySessionWithBackend(email: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(
      `${getApiBaseUrl()}/api/auth/verify?email=${encodeURIComponent(email)}`,
      { signal: controller.signal },
    );
    clearTimeout(timer);

    // 404 = user definitively does not exist on backend → invalid session
    if (res.status === 404) return false;

    // 2xx, 5xx, or other → treat as valid (server issue, not our problem)
    return true;
  } catch {
    // Network unreachable / AbortError → keep session, don't force logout
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const stored = await getStoredAuthUser();

        if (!stored) {
          // Nothing stored — user needs to log in
          if (!cancelled) setUserState(null);
          return;
        }

        // We have a stored session — verify it's still valid on the backend
        const isValid = await verifySessionWithBackend(stored.email);

        if (cancelled) return;

        if (isValid) {
          setUserState(stored);
        } else {
          // Backend says user doesn't exist (e.g. in-memory DB restarted,
          // or account was deleted). Clear local session → force login.
          await setStoredAuthUser(null);
          setUserState(null);
        }
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback(async (nextUser: AuthUser | null) => {
    setUserState(nextUser);
    await setStoredAuthUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isHydrating, setUser }),
    [user, isHydrating, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
