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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Confirm password must be at least 6 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function SignupPageSkeleton() {
  return (
    <div className="bg-white min-h-screen" aria-hidden="true">
      {/* Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-b py-4">
            <div className="h-8 w-48 bg-gray-100 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-100 rounded mx-auto mt-2" />
          </div>
        </div>
      </div>
      {/* Form */}
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

function SignupPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <SignupPageSkeleton />;
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

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setFormErrors({
        firstName: errors.firstName?.[0],
        lastName: errors.lastName?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      });
      toast({
        title: "Validation Error",
        description:
          errors.firstName ||
          errors.email ||
          errors.password ||
          errors.confirmPassword ||
          "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast({
        title: "Success",
        description: "Account created successfully! Redirecting to homepage...",
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-b py-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join us and start your skincare journey
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  First Name <span className="text-red-600">*</span>
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={cn(
                    "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                    formErrors.firstName && "border-red-600 focus-visible:ring-red-600"
                  )}
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  aria-describedby={formErrors.firstName ? "firstName-error" : undefined}
                />
                {formErrors.firstName && (
                  <p id="firstName-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={cn(
                    "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                    formErrors.lastName && "border-red-600 focus-visible:ring-red-600"
                  )}
                  placeholder="Enter your last name (optional)"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  aria-describedby={formErrors.lastName ? "lastName-error" : undefined}
                />
                {formErrors.lastName && (
                  <p id="lastName-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                    {formErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  Email Address <span className="text-red-600">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={cn(
                    "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
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
                    autoComplete="new-password"
                    required
                    className={cn(
                      "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
                >
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={cn(
                      "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                      formErrors.confirmPassword && "border-red-600 focus-visible:ring-red-600"
                    )}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    aria-describedby={formErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                    {formErrors.confirmPassword}
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
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-gray-900 hover:text-black font-medium dark:text-gray-200 dark:hover:text-white"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageSkeleton />}>
      <SignupPageContent />
    </Suspense>
  );
}