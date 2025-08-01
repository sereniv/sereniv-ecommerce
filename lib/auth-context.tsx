"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthToken,
  getUserData,
  clearAuth,
  setAuthToken,
  setUserData,
} from "./session";
import type { UserSession } from "./session";

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: UserSession) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) {
        return false;
      }

      const userData = getUserData();
      if (userData) {
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      clearAuth();
      return false;
    }
  };

  const login = (token: string, userData: UserSession) => {
    setAuthToken(token);
    setUserData(userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  console.log("user", user);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
