import { createContext, useContext, useMemo, useState } from 'react';

import { DEMO_ACCOUNT } from '../data/demoAccount.js';

const SESSION_KEY = 'silincah.demo.session';
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const local = localStorage.getItem(SESSION_KEY);
    if (local) return JSON.parse(local);

    const temporary = sessionStorage.getItem(SESSION_KEY);
    if (temporary) return JSON.parse(temporary);
  } catch {
    // Treat an unreadable session as signed out.
  }

  return null;
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing else to clear.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  async function login({ nim, password, remember = true }) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 650);
    });

    if (nim.trim() !== DEMO_ACCOUNT.nim || password !== DEMO_ACCOUNT.password) {
      const error = new Error(
        'NIM atau kata sandi demo tidak cocok. Gunakan akun demo yang tertera di halaman ini.',
      );
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const nextSession = {
      demo: true,
      name: DEMO_ACCOUNT.name,
      nim: DEMO_ACCOUNT.nim,
      email: DEMO_ACCOUNT.email,
      initials: DEMO_ACCOUNT.initials,
      signedInAt: new Date().toISOString(),
    };

    clearStoredSession();
    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } catch {
      // Session still works in memory for this tab.
    }

    setSession(nextSession);
    return nextSession;
  }

  function logout() {
    clearStoredSession();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider.');
  }

  return context;
}
