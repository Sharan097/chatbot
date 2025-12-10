// app/signup/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogo, XLogo } from "@/components/icons";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const { status } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (name && name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessages: Record<string, string> = {
          USER_EXISTS:
            "An account with this email already exists. Please login.",
          INVALID_INPUT: "Please check your input and try again.",
          WEAK_PASSWORD: "Password must be at least 6 characters.",
          INVALID_EMAIL: "Invalid email format.",
          USER_CREATE_ERROR: "Failed to create account. Please try again.",
          EMAIL_SEND_FAILED:
            "Account created but verification email failed. Please contact support.",
        };

        throw new Error(
          errorMessages[data.code] || data.message || "Registration failed"
        );
      }

      setSuccess(
        "Account created successfully! Please check your email to verify your account."
      );

      setTimeout(() => {
        router.push("/login?signup=success");
      }, 5000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Google sign-up failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleXSignup = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("twitter", { callbackUrl: "/" });
    } catch (error) {
      setError("X sign-up failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Signup Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600 text-sm">
              Sign up to start creating AI-powered cards
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{success}</p>
                  <p className="text-xs mt-1">
                    Check your inbox and spam folder for the verification link.
                  </p>
                  <p className="text-xs mt-1 font-medium">
                    Link expires in 10 minutes!
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 ml-4">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 ml-4">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1 ml-4">{errors.password}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2"
            >
              <GoogleLogo className="mr-2 h-5 w-5" />
              Sign up with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleXSignup}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2"
            >
              <div className="mr-2 h-5 w-5">
                <XLogo />
              </div>
              Sign up with X
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient Background */}
      <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
          <div
            className="absolute w-96 h-96 bg-purple-600/30 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
        <div className="relative z-10 max-w-sm p-8 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl">
          <div className="text-center">
            <div className="mb-6 inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Card Generator
            </h2>
            <p className="text-white/80 text-lg">
              Join us and transform your ideas into beautiful cards with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
