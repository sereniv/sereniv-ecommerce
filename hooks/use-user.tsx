import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/lib/utils";
import { User } from "@prisma/client";

export const useUser = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const me = useCallback(async () => {
    if (!isMounted) return null;

    try {
      const response = await fetch(getApiUrl("/me"), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const { data } = await response.json();
      setUser(data);
      return data;
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      throw error;
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const initializeUser = async () => {
      try {
        await me();
      } catch (error) {
        console.error("Failed to initialize user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [isMounted, me]);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const signup = useCallback(
    async (
      userData: Omit<User, "id" | "verified" | "role"> & { password: string }
    ) => {
      try {
        const response = await fetch(getApiUrl("/signup"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error("Registration failed");
        }

        const { data } = await response.json();
        setUser(data);

        if (data.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/submissions");
        }

        return data;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    []
  );

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const { data } = await response.json();
      setUser(data);
      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/submissions");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/logout"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Logout failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Logout successful:", data);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    me,
  };
};
