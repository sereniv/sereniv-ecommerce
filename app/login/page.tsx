"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getApiUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

function LoginPageSkeleton() {
  return (
    <div className="bg-white min-h-screen" aria-hidden="true">
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-b py-4">
            <div className="h-8 w-48 bg-gray-100 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-100 rounded mx-auto mt-2" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <div className="h-5 w-1/4 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-5 w-1/4 bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded-lg" />
          </div>
          <div className="h-12 w-full bg-gray-100 rounded-lg" />
          <div className="h-4 w-3/4 bg-gray-100 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoginPageSkeleton />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setFormErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      toast({
        title: "Validation Error",
        description:
          errors.email || errors.password || "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      toast({
        title: "Success",
        description: "Logged in successfully! Redirecting to cart...",
      });

      setTimeout(() => {
        router.push("/cart");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-b py-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome back to your account
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  Email Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={cn(
                      "h-12 pl-10 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                      formErrors.email && "border-red-600 focus-visible:ring-red-600"
                    )}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={cn(
                      "h-12 pl-10 pr-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                      formErrors.password && "border-red-600 focus-visible:ring-red-600"
                    )}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 px-8 bg-gray-900 hover:bg-black text-white rounded-lg text-base font-medium disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-gray-900 hover:text-black font-medium dark:text-gray-200 dark:hover:text-white"
              >
                Sign up instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}