"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast, Toaster } from 'react-hot-toast'; // 
import { 
  LogOut, 
  Sparkles, 
  Send, 
  User, 
  Loader2, 
  Settings, 
  Home,
  Clock, 
  Image as ImageIcon,
  TrendingUp,
  BarChart3,
  MessageSquare
} from "lucide-react";

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

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function XAgentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // ✅ FIXED: Authentication check with Twitter requirement
  useEffect(() => {
    const checkAuth = () => {
      if (status === "loading") return;

      // Step 1: Check if user is authenticated (OAuth or JWT)
      let isUserAuthenticated = false;
      let userEmailAddress = "";

      // Check OAuth authentication
      if (status === "authenticated" && session?.user) {
        isUserAuthenticated = true;
        userEmailAddress = session.user.email || 'user';
      } else {
        // Check JWT authentication
        const accessToken = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (accessToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            isUserAuthenticated = true;
            userEmailAddress = user.email || 'user';
          } catch (error) {
            console.error("Auth error:", error);
          }
        }
      }

      // If not authenticated, redirect to login
      if (!isUserAuthenticated) {
        router.push('/login');
        return;
      }

      // Step 2: ✅ Check Twitter authorization (CRITICAL)
      const twitterAuth = localStorage.getItem("twitter_authenticated");
      
      if (twitterAuth !== "true") {
        // Show error toast
        toast.error("Please authorize with X to access X Agent", {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #EF4444',
          },
        });

        // Redirect to Twitter auth page after 2 seconds
        setTimeout(() => {
          router.push('/twitter');
        }, 2000);
        return;
      }

      // Step 3: All checks passed - initialize chat
      setUserEmail(userEmailAddress);
      
      setTimeout(() => {
        setIsLoading(false);
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: "Hello! I'm your X AI Agent. How can I assist you today?",
            timestamp: new Date(),
          },
        ]);
      }, 1500);
    };

    checkAuth();
  }, [router, session, status]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }

      localStorage.clear();
      sessionStorage.clear();

      if (session) {
        await signOut({ 
          callbackUrl: '/login',
          redirect: true 
        });
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = '/login';
    }
  };

  const handleSendMessage = async (overrideContent?: string) => {
    const contentToSend = typeof overrideContent === 'string' ? overrideContent : inputValue;
    
    if (!contentToSend.trim() || isSending) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: contentToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    setTimeout(() => {
      let replyContent = "";
      const lowerInput = userMessage.content.toLowerCase();
      
      if (lowerInput.includes("schedule") || lowerInput.includes("optimal")) {
        replyContent = "📅 **Optimal Posting Schedule**\n\nBased on your audience analytics:\n\n• **Tomorrow @ 10:00 AM EST** (Peak Traffic)\n• **Wednesday @ 3:00 PM EST** (High Engagement)\n• **Friday @ 7:00 PM EST** (Weekend Prep)\n\nAverage engagement rate: **+47%** during these windows.\n\nWould you like me to auto-schedule your upcoming posts?";
      } else if (lowerInput.includes("picture") || lowerInput.includes("caption") || lowerInput.includes("image")) {
        replyContent = "📸 **Image Caption Generator**\n\nI can help create engaging captions! Here's what I can do:\n\n1. **AI-Generated Captions** - Describe your image theme\n2. **Trending Hashtags** - Auto-suggest viral tags\n3. **Alt Text** - Accessibility-friendly descriptions\n4. **CTA Suggestions** - Boost engagement\n\nPlease describe your image or upload it, and I'll craft the perfect caption!";
      } else if (lowerInput.includes("analytics") || lowerInput.includes("stats") || lowerInput.includes("performance")) {
        replyContent = "📊 **Performance Analytics (Last 24h)**\n\n• **Impressions:** 12,584 (↑ 15.3%)\n• **Profile Visits:** 1,203 (↑ 8.7%)\n• **New Followers:** +45 (↑ 22.1%)\n• **Engagement Rate:** 4.2% (↑ 0.8%)\n\n🔥 **Top Performing Post:**\n'AI Trends 2025' thread - 3.2K engagements\n\n💡 **Recommendation:** Your audience loves tech content. Post more on Tuesdays & Thursdays.";
      } else if (lowerInput.includes("tweet") || lowerInput.includes("post") || lowerInput.includes("content")) {
        replyContent = "✍️ **Content Generation Ready**\n\nI can create:\n\n• **Engaging Tweets** - Hook-driven content\n• **Thread Series** - Deep-dive topics\n• **Replies** - Smart comment responses\n• **Polls** - Boost interaction\n\nWhat topic or theme should I create content about?";
      } else if (lowerInput.includes("trend") || lowerInput.includes("viral") || lowerInput.includes("trending")) {
        replyContent = "🔥 **Trending Topics Right Now**\n\n1. #AIRevolution - 127K posts\n2. #TechInnovation - 89K posts\n3. #FutureOfWork - 56K posts\n\n💡 **Opportunity:** Jump on #AIRevolution with your unique take. Posts using this tag see **3x more engagement**.\n\nWant me to draft a trending tweet?";
      } else {
        replyContent = `I understand you're interested in: **"${userMessage.content}"**\n\n🤖 **As your X AI Agent, I can help with:**\n\n• 📝 Generate tweets, threads & captions\n• 📊 Analyze performance metrics\n• ⏰ Schedule posts at peak times\n• 🎯 Monitor trends & sentiment\n• 💬 Automate replies & DMs\n• 🔍 Track competitor insights\n\n**What specific task would you like me to handle first?**`;
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsSending(false);
    }, 1800);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <XLogo className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <XLogo className="w-8 h-8" />
              AI Agent
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Connected as @{userEmail.split('@')[0] || 'user'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-6">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Initializing agent protocols...</p>
          </div>

          <div className="space-y-2 pt-4 text-xs text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Connecting to X API...
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Loading analytics engine...
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Preparing AI models...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Container */}
      <Toaster />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="flex-shrink-0 h-16 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/50 shadow-2xl">
          <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <XLogo className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  X AI Agent
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                </h1>
                <p className="text-xs text-gray-400">
                  @{userEmail.split('@')[0] || 'user'} • Connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white group"
                title="Home"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white group"
                title="Settings"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/30 hover:border-red-500/50 group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <main 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 pb-56">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mt-1 shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl px-5 py-4 rounded-2xl shadow-xl ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                      : "bg-slate-800/90 backdrop-blur-sm text-gray-100 rounded-tl-sm border border-slate-700/50"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-[10px] opacity-50 mt-2.5 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mt-1 shadow-lg shadow-purple-900/30 ring-2 ring-purple-400/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-slate-800/90 border border-slate-700/50 rounded-tl-sm backdrop-blur-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 h-56 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-40 border-t border-slate-800/30">
          <div className="h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-4">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => handleSendMessage("Schedule posts at optimal times")}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-medium rounded-full border border-slate-700/50 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-blue-900/20 backdrop-blur-sm group"
              >
                <Clock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Schedule Posts
              </button>
              <button
                onClick={() => handleSendMessage("Post a picture with caption")}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-purple-400 hover:text-purple-300 text-xs font-medium rounded-full border border-slate-700/50 hover:border-purple-500/50 transition-all shadow-sm hover:shadow-purple-900/20 backdrop-blur-sm group"
              >
                <ImageIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Image Caption
              </button>
              <button
                onClick={() => handleSendMessage("Show analytics")}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-green-400 hover:text-green-300 text-xs font-medium rounded-full border border-slate-700/50 hover:border-green-500/50 transition-all shadow-sm hover:shadow-green-900/20 backdrop-blur-sm group"
              >
                <BarChart3 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Analytics
              </button>
              <button
                onClick={() => handleSendMessage("What's trending?")}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-orange-400 hover:text-orange-300 text-xs font-medium rounded-full border border-slate-700/50 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-orange-900/20 backdrop-blur-sm group"
              >
                <TrendingUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Trending
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <div className="relative flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask X AI Agent anything..."
                  disabled={isSending}
                  className="flex-1 bg-transparent text-white placeholder:text-gray-500 px-4 py-3.5 outline-none text-sm font-medium disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isSending}
                  className="flex-shrink-0 p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg hover:shadow-blue-900/50 disabled:shadow-none group"
                >
                  <Send className="w-5 h-5 text-white group-disabled:text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Powered by agentic AI • Press Enter to send
            </p>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
}
