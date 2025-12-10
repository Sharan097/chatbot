"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  MessageSquare,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ExpandedCardProps {
  isOpen: boolean;
  onClose: () => void;
  tweets: string[];
  trending: string[];
  analytics?: {
    impressions: number;
    followers: number;
    engagement: string;
  };
}

export function ExpandedCard({
  isOpen,
  onClose,
  tweets,
  trending,
  analytics,
}: ExpandedCardProps) {
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatedTweets, setUpdatedTweets] = useState(tweets);

  // ---- REFRESH HANDLER ---- //
  const refreshTweets = async () => {
    try {
      setIsRefreshing(true);

      // Simulate backend call for updated data
      await new Promise((r) => setTimeout(r, 1200));

      // Replace with your API call
      const newTweets = [
        "🔄 Refreshed Tweet: Latest insights loaded!",
        "Your X feed was updated just now.",
        "Here are the newest posts from your network.",
        ...tweets,
      ];

      setUpdatedTweets(newTweets);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMoreAgenticUse = () => {
    console.log("[EXPANDED CARD] Redirecting to X Agent page");
    onClose(); // Close the modal first
    setTimeout(() => {
      router.push("/xagent");
    }, 300); // Small delay to ensure modal closes smoothly
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100]"
            onClick={onClose}
            aria-hidden
          />

          {/* Expanded Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-2xl max-h-[82vh] bg-white text-slate-900 dark:bg-black dark:text-white rounded-2xl
                         shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800"
              role="dialog"
              aria-modal="true"
            >
              {/* HEADER */}
              <div
                className="sticky top-0 z-10 px-5 py-3 bg-slate-800 dark:bg-slate-900 text-white
                           flex items-center justify-between"
              >
                {/* Left Side Branding */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center
                               ring-1 ring-white/6"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white/90">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold leading-tight">
                      Social Media Dashboard
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Connected • Live X insights
                    </p>
                  </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-2">
                  {/* Refresh Button */}
                  <button
                    onClick={refreshTweets}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all relative"
                    aria-label="Refresh tweets"
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-white/90 transition-transform ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close dashboard"
                  >
                    <X className="w-5 h-5 text-white/90" />
                  </button>
                </div>
              </div>

              {/* Compact quick stats */}
              {analytics && (
                <div className="px-5 py-3 bg-white dark:bg-black/90 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-3">
                      <p className="text-[11px] text-slate-500 dark:text-slate-300">Impressions</p>
                      <p className="text-lg font-semibold mt-1">
                        {analytics.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-3">
                      <p className="text-[11px] text-slate-500 dark:text-slate-300">Followers</p>
                      <p className="text-lg font-semibold mt-1">
                        {analytics.followers.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-3">
                      <p className="text-[11px] text-slate-500 dark:text-slate-300">Engagement</p>
                      <p className="text-lg font-semibold mt-1">
                        {analytics.engagement}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(82vh-120px)] p-5 space-y-5">
                {/* Trending Section */}
                <section>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm font-semibold">Trending Now</h3>
                    </div>
                    <p className="text-xs text-slate-400">Live • personalized</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {trending.map((t, i) => (
                      <button
                        key={i}
                        className="px-3 py-2 bg-white dark:bg-slate-900/60 border rounded-md
                                   text-sm font-medium hover:scale-[1.02] transition-transform"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Tweets Section */}
                <section>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-sky-500" />
                    <h3 className="text-sm font-semibold">Recent Tweets</h3>
                  </div>

                  <div className="mt-3 space-y-3">
                    {updatedTweets.map((tweet, i) => (
                      <article
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 border rounded-xl"
                      >
                        <p className="text-sm dark:text-slate-100">{tweet}</p>

                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {Math.floor(Math.random() * 400 + 60)} views
                          </span>

                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {Math.floor(Math.random() * 40 + 2)} replies
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {/* AI Insight */}
                <section>
                  <div className="p-3 bg-gradient-to-r from-white to-white/60 dark:from-slate-900/40 dark:to-slate-900/20 border rounded-xl">
                    <h4 className="text-sm font-semibold mb-1">AI Insight</h4>
                    <p className="text-sm">
                      Engagement is rising — tech posts perform best Tuesdays at 10 AM EST.
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer CTA */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white/90 dark:from-black/95 p-4 border-t">
                <button
                  onClick={handleMoreAgenticUse}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                             bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold
                             hover:from-indigo-700 hover:to-violet-700 shadow transition-all
                             active:scale-95"
                >
                  <span>More Agentic Use</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
