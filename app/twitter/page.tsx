// app/twitter/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Check, AlertCircle } from "lucide-react";

// Inline X Logo SVG Component
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function TwitterAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTwitterAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/check-twitter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!result.success) {
        setError(
          result.error ||
            "Failed to authenticate. Check Twitter Client ID and Secret."
        );
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      localStorage.setItem("twitter_authenticated", "true");

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-gray-900 dark:to-black flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, transparent 70%)",
            top: "20%",
            left: "20%",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, transparent 70%)",
            bottom: "20%",
            right: "20%",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* COMPACT CARD */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl p-6 transition-colors duration-300">
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-400/10 via-blue-400/10 to-slate-400/10 blur-xl opacity-40"></div>

          <div className="relative z-10 space-y-5">
            {/* Header: Compact Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-slate-400/30 dark:bg-blue-500/30 rounded-full blur-lg opacity-50"></div>
                <div className="relative w-12 h-12 rounded-full bg-slate-900 dark:bg-blue-600 flex items-center justify-center shadow-lg">
                  <XLogo className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    X AI Agent
                  </h1>
                  <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by X API
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-200/50 dark:bg-slate-700/50"></div>

            {/* Main Content */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Connect Account
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unlock AI-powered insights and automated responses securely.
              </p>

              {/* Features: Compact Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["Content Gen", "Analytics", "Scheduling", "Sentiment"].map(
                  (feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-700 dark:text-slate-300"
                    >
                      <Check className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      {feature}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <p className="text-xs font-semibold">Connected! Redirecting...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
                <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-xs">{error}</p>
                </div>
              </div>
            )}

            {/* Authorization Button */}
            <button
              onClick={handleTwitterAuth}
              disabled={isLoading || success}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 dark:from-blue-600 dark:to-blue-700 p-[1px] transition-all hover:shadow-lg hover:shadow-slate-300/30 dark:hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative w-full h-full rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-3 transition-all group-hover:bg-white/70 dark:group-hover:bg-slate-800/70">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-900 dark:text-white text-sm font-semibold">
                      Connecting...
                    </span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-900 dark:text-white text-sm font-semibold">
                      Connected Successfully
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XLogo className="w-4 h-4 text-slate-900 dark:text-white" />
                    <span className="text-slate-900 dark:text-white text-sm font-semibold">
                      Authorize with X
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </div>
            </button>

            {/* Footer */}
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
              Secure authentication via NextAuth
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(15px, -15px) scale(1.05);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.95);
          }
        }

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
