// app/login/page.tsx
// UserName: test@example.com
// Password: password@123

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Mail, Lock, Chrome } from "lucide-react";
import { GoogleLogo } from "@/components/icons";
import Link from "next/link";


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect to home
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setErrors({});

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error('Google login error:', error);
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 ml-4">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1 ml-4">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all mt-6"
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
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all">
              <GoogleLogo className="mr-2 h-5 w-5" />
                  Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              No account?{' '}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Gradient Background with Glassmorphism */}
      <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 gradient-bg">
          <div className="gradients-container h-full w-full blur-lg">
            {/* First Gradient Orb */}
            <div 
              className="absolute w-[600px] h-[600px] rounded-full opacity-70 animate-float-slow"
              style={{
                background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0) 70%)',
                top: '10%',
                left: '10%',
                filter: 'blur(40px)',
              }}
            />
            
            {/* Second Gradient Orb */}
            <div 
              className="absolute w-[500px] h-[500px] rounded-full opacity-60 animate-float-medium"
              style={{
                background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0) 70%)',
                top: '40%',
                right: '10%',
                filter: 'blur(40px)',
              }}
            />
            
            {/* Third Gradient Orb */}
            <div 
              className="absolute w-[450px] h-[450px] rounded-full opacity-50 animate-float-fast"
              style={{
                background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.8) 0%, rgba(236, 72, 153, 0) 70%)',
                bottom: '10%',
                left: '30%',
                filter: 'blur(40px)',
              }}
            />
            
            {/* Fourth Gradient Orb */}
            <div 
              className="absolute w-[550px] h-[550px] rounded-full opacity-40 animate-float-reverse"
              style={{
                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(40px)',
              }}
            />
          </div>
        </div>

        {/* Glassmorphism Overlay Card */}
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
            <p className="text-white/80 text-lg leading-relaxed">
              Transform your ideas into cards with the power of AI-Agent
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 30px) rotate(120deg); }
          66% { transform: translate(40px, -20px) rotate(240deg); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -50px) scale(1.2); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Main component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
