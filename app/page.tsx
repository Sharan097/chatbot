"use client";

import { useState, KeyboardEvent, FormEvent, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { ExpandedCard } from "@/components/card/ExpandedCard";
import {
  Search,
  LogOut,
  CreditCard,
  Send,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SocialMediaIcon,
  BoardingPassIcon,
  DiagnosticsIcon,
  ConcertTicketIcon,
  FlightTicketIcon,
  MatchTicketIcon,
} from "@/components/icons";

const cardData = [
  {
    id: 1,
    icon: <SocialMediaIcon />,
    title: "Social Media Engine",
    description: "AI-powered social media automation with X integration",
    color: "blue" as const,
    brandLogo: "x" as const,
    keywords: ["social", "media", "twitter", "x", "facebook", "instagram", "engine", "ai"],
    requiresTwitterAuth: true,
  },
  {
    id: 2,
    icon: <BoardingPassIcon />,
    title: "Boarding Pass",
    description: "Your Flight boarding pass",
    color: "purple" as const,
    brandLogo: "apple" as const,
    keywords: ["boarding", "pass", "flight", "airport", "travel", "plane"],
    redirectTo: "/chatbot",
  },
  {
    id: 3,
    icon: <DiagnosticsIcon />,
    title: "AI Diagnostics",
    description: "Advanced AI diagnostic tools",
    color: "green" as const,
    brandLogo: "google" as const,
    keywords: ["diagnostics", "ai", "medical", "health", "analysis", "tools"],
  },
  {
    id: 4,
    icon: <ConcertTicketIcon />,
    title: "Concert Tickets",
    description: "Tickets for your favorite occasion",
    color: "blue" as const,
    brandLogo: "microsoft" as const,
    keywords: ["concert", "tickets", "music", "event", "show", "entertainment"],
  },
  {
    id: 5,
    icon: <FlightTicketIcon />,
    title: "Flight Tickets",
    description: "Book your flight tickets with AI assistance",
    color: "purple" as const,
    brandLogo: "spotify" as const,
    keywords: ["flight", "tickets", "travel", "booking", "airplane", "airline"],
  },
  {
    id: 6,
    icon: <MatchTicketIcon />,
    title: "Match Tickets",
    description: "Tickets for the upcoming match events",
    color: "green" as const,
    brandLogo: "netflix" as const,
    keywords: ["match", "tickets", "sports", "game", "stadium", "event"],
  },
];

type ChatMessage = {
  id: number;
  type: "user" | "ai";
  text: string;
  timestamp: Date;
};

interface JWTUser {
  email: string;
  name?: string;
  role?: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [filteredCards, setFilteredCards] = useState(cardData);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false);
  const [isExpandedCardOpen, setIsExpandedCardOpen] = useState(false);
  const [jwtUser, setJwtUser] = useState<JWTUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [twitterData] = useState({
    tweets: [
      "Just launched our new AI-powered analytics dashboard! 🚀 #AIInnovation",
      "Excited to announce our partnership with leading tech companies to bring AI to everyone 🤖",
      "Sharing insights on the future of social media automation. Thread 🧵👇",
    ],
    trending: [
      "#AIRevolution",
      "#TechInnovation",
      "#FutureOfWork",
      "#MachineLearning",
      "#SocialMedia",
      "#Automation",
    ],
    analytics: {
      impressions: 12584,
      followers: 3247,
      engagement: "4.2%",
    },
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "ai",
      text: "Hello! How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          const userData = JSON.parse(userStr);
          if (isMounted) {
            setJwtUser(userData);
          }
        }

        const twitterAuth = localStorage.getItem("twitter_authenticated");
        if (twitterAuth === "true" && isMounted) {
          setIsTwitterAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking JWT auth:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    if (status !== "loading") {
      checkAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  const user = session?.user || jwtUser;

  const handleLogout = async () => {
    try {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      const refreshToken = localStorage.getItem("refresh_token");
      const userStr = localStorage.getItem("user");
      const email = userStr ? JSON.parse(userStr).email : null;

      if (refreshToken && email) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refreshToken,
              email,
              logoutAll: false,
            }),
            credentials: "include",
          });
        } catch (err) {
          console.error("Logout API error:", err);
        }
      }

      localStorage.clear();
      sessionStorage.clear();

      if (session) {
        await signOut({
          callbackUrl: "/login",
          redirect: true,
        });
      } else {
        window.location.replace("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  const handleCardClick = (cardId: number) => {
    if (cardId === 1 && isTwitterAuthenticated) {
      setIsExpandedCardOpen(true);
      setSelectedCardId(cardId);
      return;
    }

    setSelectedCardId((prevId) => (prevId === cardId ? null : cardId));
  };

  const handleStartChatting = () => {
    const selectedCard = cardData.find((card) => card.id === selectedCardId);
    if (!selectedCard) return;

    if (selectedCard.requiresTwitterAuth) {
      if (isTwitterAuthenticated) {
        setIsExpandedCardOpen(true);
      } else {
        router.push("/twitter");
      }
    } else if (selectedCard.redirectTo) {
      router.push(selectedCard.redirectTo);
    } else {
      alert(`${selectedCard.title} functionality coming soon!`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredCards(cardData);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchedCards = cardData.filter(
      (card) =>
        card.title.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery) ||
        card.keywords.some((keyword) => keyword.includes(lowerQuery))
    );

    setFilteredCards(matchedCards);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: "user",
      text: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const lowerQuery = chatInput.toLowerCase();
      const matchedCards = cardData.filter(
        (card) =>
          card.title.toLowerCase().includes(lowerQuery) ||
          card.description.toLowerCase().includes(lowerQuery) ||
          card.keywords.some((keyword) => keyword.includes(lowerQuery))
      );

      let aiResponse = "";
      if (matchedCards.length > 0) {
        const cardTitles = matchedCards.map((c) => c.title).join(", ");
        aiResponse = `I found ${matchedCards.length} card(s): ${cardTitles}. Check the right side!`;
        setFilteredCards(matchedCards);
      } else {
        aiResponse = `I couldn't find cards matching "${chatInput}". Try: Social Media Engine, Boarding Pass, Diagnostics, Concert Tickets, Flight Tickets, or Match Tickets.`;
        setFilteredCards(cardData);
      }

      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: "ai",
        text: aiResponse,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    }, 500);

    setChatInput("");
  };

  const handleChatSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleChatSend();
  };

  const handleChatKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleChatSend();
    }
  };

  if (status === "loading" || isInitializing) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading AI Card Generator
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Preparing your experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-red-600 dark:border-red-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Logging out...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Clearing session and redirecting
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-orange-600 dark:border-orange-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-white dark:bg-gray-900">
        {/* TOP HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          {/* Removed max-w-7xl to allow full-width on large screens */}
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3 flex items-center justify-between gap-4">
            {/* Left: User Info - Will stick to left edge */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-300/30 dark:border-purple-700/30">
                {/* Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {user?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase()}
                </div>
                
                {/* User Details */}
                <div className="hidden xs:block min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {user?.email}
                  </p>
                </div>
                
                {/* Role Badge */}
                {user?.role === "admin" ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex-shrink-0">
                    <Crown className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs font-semibold">Admin</span>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
                    <UserIcon className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs font-semibold">User</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions - Will stick to right edge */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Payment Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/payment")}
                className="text-black dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-purple-300 dark:border-purple-700 rounded-full transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">
                  Payment
                </span>
                <span className="md:hidden text-xs font-medium">Pay</span>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="hidden md:inline text-sm">
                      Logging out...
                    </span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">
                      Logout
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="w-full h-screen pt-16 grid grid-cols-1 lg:grid-cols-[30%_70%]">
          {/* Left Section - Chatbot */}
          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-pink-200/50 to-orange-200/50 dark:from-purple-800/30 dark:via-pink-800/30 dark:to-orange-800/30 blur-3xl opacity-60" />

            <div className="max-w-md w-full h-full flex flex-col justify-between relative z-10">
              {selectedCardId !== null ? (
                <div className="text-center space-y-4 sm:space-y-6 w-full my-auto">
                  <div className="inline-block p-3 sm:p-4 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg backdrop-blur-sm transform transition-transform duration-300 hover:scale-110">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Ready to Create Cards?
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You selected:{" "}
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {cardData.find((card) => card.id === selectedCardId)?.title}
                    </span>
                  </p>
                  {cardData.find((card) => card.id === selectedCardId)
                    ?.requiresTwitterAuth &&
                    !isTwitterAuthenticated && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                        ⚠️ Requires X/Twitter authentication
                      </p>
                    )}
                  <button
                    onClick={handleStartChatting}
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    {cardData.find((card) => card.id === selectedCardId)
                      ?.requiresTwitterAuth && !isTwitterAuthenticated
                      ? "Connect X Account →"
                      : cardData.find((card) => card.id === selectedCardId)
                          ?.redirectTo
                      ? "Start Chatting →"
                      : "View Dashboard →"}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      AI Assistant
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Ask me to find cards for you
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md ${
                            message.type === "user"
                              ? "bg-white/95 text-gray-900 rounded-tr-lg"
                              : "bg-blue-500 text-white rounded-tl-lg"
                          }`}
                        >
                          <p className="text-xs sm:text-sm font-medium break-words">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleChatSubmit} className="relative w-full">
                    <div className="group flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                      <div className="flex-shrink-0 pl-3 sm:pl-4 text-gray-400 dark:text-gray-500">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleChatKeyPress}
                        placeholder="Type here for cards..."
                        className="flex-grow min-w-0 py-2.5 sm:py-3 px-2 bg-transparent text-gray-900 dark:text-white outline-none focus:outline-none focus:ring-0 border-none text-xs sm:text-sm md:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />

                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="flex-shrink-0 m-1.5 sm:m-2 p-1.5 sm:p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 disabled:active:scale-100 transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-md"
                        title="Send message"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Cards */}
          <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
            <div className="min-h-full flex flex-col p-4 sm:p-6 lg:p-10">
              <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Card Generator
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                    The fastest way from prompt to Smartcard with AI
                  </p>
                </div>

                {searchQuery && (
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredCards.length > 0
                        ? `Found ${filteredCards.length} card${
                            filteredCards.length !== 1 ? "s" : ""
                          } matching "${searchQuery}"`
                        : `No cards found matching "${searchQuery}"`}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
                  {filteredCards.map((cardItem) => (
                    <Card
                      key={cardItem.id}
                      ref={(el) => {
                        cardRefs.current[cardItem.id] = el;
                      }}
                      icon={cardItem.icon}
                      title={cardItem.title}
                      description={cardItem.description}
                      color={cardItem.color}
                      brandLogo={cardItem.brandLogo}
                      onClick={() => handleCardClick(cardItem.id)}
                      active={selectedCardId === cardItem.id}
                      isConnected={cardItem.id === 1 && isTwitterAuthenticated}
                      previewData={
                        cardItem.id === 1 && isTwitterAuthenticated
                          ? {
                              tweets: twitterData.tweets.slice(0, 1),
                              trending: twitterData.trending.slice(0, 3),
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>

                {filteredCards.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <Search className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No cards found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Try searching for: Social Media Engine, Boarding Pass,
                      Diagnostics, Concert Tickets, Flight Tickets, or Match
                      Tickets
                    </p>
                    <button
                      onClick={() => handleSearch("")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Show All Cards
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Card Modal */}
      <ExpandedCard
        isOpen={isExpandedCardOpen}
        onClose={() => setIsExpandedCardOpen(false)}
        tweets={twitterData.tweets}
        trending={twitterData.trending}
        analytics={twitterData.analytics}
      />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
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
    </>
  );
}
