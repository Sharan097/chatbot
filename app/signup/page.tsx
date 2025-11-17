// app/signup/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogo } from "@/components/icons";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const { status } = useSession();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/');
    }
  }, [status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render if authenticated
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: '/' });
    } catch (error) {
      console.error('Google signup error:', error);
      setError("Google sign-up failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Signup Form */}
      <div className="flex items-center justify-center p-8 bg-white relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <Input
                id="name"
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-6 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 ml-4 animate-fade-in">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
                <p className="text-sm text-red-600 mt-1 ml-4 animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
                <p className="text-sm text-red-600 mt-1 ml-4 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleLogo className="mr-2 h-5 w-5" />
              Sign up with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="w-full py-6 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-900 font-medium rounded-full shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign up with X
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Gradient Background */}
      <div className="hidden lg:flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full">
            <div 
              className="absolute w-[600px] h-[600px] rounded-full opacity-70"
              style={{
                background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0) 70%)',
                top: '10%',
                left: '10%',
                filter: 'blur(40px)',
                animation: 'float-slow 20s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute w-[500px] h-[500px] rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0) 70%)',
                top: '40%',
                right: '10%',
                filter: 'blur(40px)',
                animation: 'float-medium 15s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute w-[450px] h-[450px] rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.8) 0%, rgba(236, 72, 153, 0) 70%)',
                bottom: '10%',
                left: '30%',
                filter: 'blur(40px)',
                animation: 'float-fast 10s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute w-[550px] h-[550px] rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                filter: 'blur(40px)',
                animation: 'float-reverse 25s linear infinite',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-sm p-8 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl">
          <div className="text-center">
            <div className="mb-6 inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Card Generator
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Join us and transform your ideas into beautiful cards with AI
            </p>
          </div>
        </div>
      </div>

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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
