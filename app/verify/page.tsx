"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing. Please check your email link.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
          setUserEmail(data.user?.email || "");

          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            data.message || "Failed to verify email. The link may be invalid or expired."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Loading State */}
          {status === "loading" && (
            <>
              <div className="mb-6">
                <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <svg
                    className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
              <div className="mt-4 text-xs text-gray-500">
                This should only take a moment
              </div>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <div className="mb-6">
                <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full animate-bounce">
                  <svg
                    className="w-16 h-16 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              {userEmail && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  {userEmail}
                </p>
              )}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
              <Link
                href="/login?verified=true"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Go to Login Now →
              </Link>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <div className="mb-6">
                <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <svg
                    className="w-16 h-16 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  The verification link may have expired (10 min limit) or already been used.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Create New Account
                </Link>
                <Link
                  href="/login"
                  className="block px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-full transition-all active:scale-95"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
