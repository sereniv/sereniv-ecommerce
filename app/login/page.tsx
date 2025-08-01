"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginPageSkeleton() {
  return (
    <Container>
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-200 rounded"></div>
            <div className="h-12 w-full bg-gray-200 rounded"></div>
            <div className="h-12 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");
    const messageParam = searchParams.get("message");

    if (emailParam && passwordParam) {
      setEmail(emailParam);
      setPassword(passwordParam);
      handleLogin(emailParam, passwordParam);
    }

    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (!mounted || authLoading) {
    return <LoginPageSkeleton />;
  }

  // If already authenticated, show loading
  if (isAuthenticated) {
    return <LoginPageSkeleton />;
  }

  const handleLogin = async (emailValue: string, passwordValue: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Use auth context to login
      login(data.data.token, data.data.user);

      // Add a small delay for better UX
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <Container>
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-tighter mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  {/* <Mail className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" /> */}
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  {/* <Lock className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" /> */}
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-16 pr-12 h-12 text-base border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 text-base font-medium bg-gray-900 text-white hover:bg-black rounded-full px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-gray-900 hover:text-black font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
