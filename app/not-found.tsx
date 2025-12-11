"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="text-center">
            {/* Animated 404 Icon */}
            <div className="mb-8">
              <FileQuestion className="w-24 h-24 mx-auto text-indigo-600 animate-bounce" />
            </div>

            {/* 404 Title */}
            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              404
            </h1>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Countdown */}
            <p className="text-sm text-indigo-600 font-medium">
              Redirecting to home in{" "}
              <span className="text-2xl font-bold">{Math.max(countdown, 0)}</span> seconds
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
