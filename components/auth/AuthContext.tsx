"use client";

import { createContext, useContext, useEffect, useState } from "react";

//container to manage user login 

//current login status of user
interface AuthStatus {
  authenticated: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

//states & actions
interface AuthContextType {
  authStatus: AuthStatus;
  checkingAuth: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    //default login to false
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
  const [checkingAuth, setCheckingAuth] = useState(true);

  //grab login status from api
  async function refreshAuth() {
    try {
      const res = await fetch("/api/whoop/status");
      const data = await res.json();
      setAuthStatus(data);
    } catch {
      setAuthStatus({ authenticated: false });
    } finally {
      setCheckingAuth(false);
    }
  }

  //delete cookie on logout
  function logout() {
    document.cookie = "whoop_access_token=; Max-Age=0; path=/";
    setAuthStatus({ authenticated: false });
  }

  //when website loads, quickly check if user is logged in
  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authStatus, checkingAuth, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
