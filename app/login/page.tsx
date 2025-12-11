"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { Mail, Lock, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { GoogleLogo, XLogo } from "@/components/icons";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginForm() {
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const register = searchParams.get("register");
  const authError = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    setError("");
    setSuccess("");
    setShowResendVerification(false);

    if (verified === "true") {
      setSuccess("Email verified successfully! You can now log in.");
    } else if (register === "success") {
      setSuccess("Account created! Please check your email to verify.");
    } else if (authError === "unauthorized") {
      setError("Please log in to access that page.");
    } else if (authError === "session_expired") {
      setError("Your session has expired. Please login again.");
    }
  }, [verified, register, authError]);

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address to resend verification.");
      return;
    }

    setResendingEmail(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to resend verification email");
      }

      setSuccess("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification email"
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setErrors({});
    setShowResendVerification(false);

    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as "email" | "password"] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!result.success) {
        if (result.code === "EMAIL_NOT_VERIFIED") {
          setError(
            "Please verify your email before logging in. Check your inbox!"
          );
          setShowResendVerification(true);
          setIsLoading(false);
          return;
        }

        const errorMessages: Record<string, string> = {
          RATE_LIMIT_EXCEEDED:
            "Too many attempts. Please try again in 15 minutes.",
          ACCOUNT_LOCKED: "Your account is locked. Please contact support.",
          INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
          MISSING_CREDENTIALS: "Please enter email and password.",
          INVALID_INPUT: "Invalid email or password format.",
        };

        setError(errorMessages[result.code] || result.message || "Login failed.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("access_token", result.data.accessToken);
      localStorage.setItem("refresh_token", result.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        const redirectUrl = callbackUrl || "/";
        window.location.href = redirectUrl;
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", {
        callbackUrl: callbackUrl || "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Google login error:", error);
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("twitter", {
        callbackUrl: callbackUrl || "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Twitter login error:", error);
      setError("X/Twitter sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm">Sign in to AI Card Generator</p>
            {/* {process.env.NODE_ENV === "development" && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  Test Login:
                </p>
                <p className="text-xs text-blue-600 font-mono">
                  test@example.com / password123
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Access: 15 min | Refresh: 30 days
                </p>
              </div>
            )} */}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Resend Verification Section */}
          {showResendVerification && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-fade-in">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium mb-1">
                    Email Not Verified
                  </p>
                  <p className="text-xs text-yellow-700">
                    Didn&apos;t receive the email? Check your spam folder or click below
                    to resend.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingEmail || !email}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {resendingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 ml-4">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1 ml-4">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleLogo className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleTwitterLogin}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="mr-2 h-5 w-5">
                <XLogo />
              </div>
              Sign in with X
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              No account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient */}
      <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
          <div
            className="absolute w-96 h-96 bg-purple-600/30 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-sm p-6 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl">
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
              Transform ideas into cards with AI
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
