// app/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { SearchBar } from "@/components/search";
import {
  SettingsIcon,
  ChatIcon,
  ChartIcon,
  TemplateIcon,
  MagicIcon,
  ShareIcon,
} from "@/components/icons";

// Define card data for filtering
const cardData = [
  {
    id: 1,
    icon: <SettingsIcon />,
    title: "Choose Your AI Engine",
    description: "Select from powerful AI models to power your card creation",
    color: "blue" as const,
    brandLogo: "x" as const,
    keywords: ["ai", "engine", "model", "select", "choose", "settings"]
  },
  {
    id: 2,
    icon: <ChatIcon />,
    title: "Chat with AI to Create Cards",
    description: "Describe your card and let AI generate it for you instantly",
    color: "purple" as const,
    brandLogo: "apple" as const,
    keywords: ["chat", "ai", "create", "generate", "describe", "instant"]
  },
  {
    id: 3,
    icon: <ChartIcon />,
    title: "View Your Generated Cards",
    description: "Monitor and manage all your AI-created cards in one place",
    color: "green" as const,
    brandLogo: "google" as const,
    keywords: ["view", "generated", "monitor", "manage", "cards", "dashboard"]
  },
  {
    id: 4,
    icon: <TemplateIcon />,
    title: "Customize Card Templates",
    description: "Browse and personalize pre-designed templates for any occasion",
    color: "blue" as const,
    brandLogo: "microsoft" as const,
    keywords: ["customize", "template", "browse", "personalize", "design"]
  },
  {
    id: 5,
    icon: <MagicIcon />,
    title: "Generate Smart Card Designs",
    description: "Transform your ideas into beautiful cards with AI-powered creativity",
    color: "purple" as const,
    brandLogo: "spotify" as const,
    keywords: ["generate", "smart", "design", "transform", "ideas", "creative"]
  },
  {
    id: 6,
    icon: <ShareIcon />,
    title: "Export & Share Cards",
    description: "Download your cards in multiple formats or share directly to social media",
    color: "green" as const,
    brandLogo: "netflix" as const,
    keywords: ["export", "share", "download", "social", "media", "formats"]
  },
];

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [filteredCards, setFilteredCards] = useState(cardData);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChatClick = () => {
    setShowChatPrompt(!showChatPrompt);
  };

  const handleStartChatting = () => {
    router.push("/chatbot");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // AUTO-RESET: If query is empty, show all cards
    if (!query.trim()) {
      setFilteredCards(cardData);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = cardData.filter(card => 
      card.title.toLowerCase().includes(lowerQuery) ||
      card.description.toLowerCase().includes(lowerQuery) ||
      card.keywords.some(keyword => keyword.includes(lowerQuery))
    );

    setFilteredCards(filtered);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">
      {/* Main Container with Grid Layout for Perfect Alignment */}
      <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-[30%_70%]">
        
        {/* Left Section - Chat Prompt (30%) */}
        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-pink-200/50 to-orange-200/50 dark:from-purple-800/30 dark:via-pink-800/30 dark:to-orange-800/30 blur-3xl opacity-60"></div>

          <div className="max-w-md w-full flex flex-col items-center justify-center relative z-10" style={{ minHeight: '280px' }}>
            {showChatPrompt ? (
              <div className="text-center space-y-4 sm:space-y-6 w-full">
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                  Ready to Create Cards?
                </h2>
                <button
                  onClick={handleStartChatting}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transform hover:translate-y-[-2px] active:translate-y-0"
                >
                  Start Chatting →
                </button>
              </div>
            ) : (
              <div className="w-full space-y-4 sm:space-y-6">
                <div className="bg-gray-100/90 dark:bg-gray-800/90 rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:translate-y-[-2px]">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1"
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
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white font-medium">
                      Chatbot will assist you soon
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-orange-400/90 dark:from-purple-600/90 dark:via-pink-600/90 dark:to-orange-500/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl transform hover:translate-y-[-2px]">
                  <div className="mb-4 sm:mb-6 flex justify-start">
                    <div className="bg-blue-500 text-white rounded-3xl rounded-tl-lg px-4 sm:px-6 py-3 sm:py-4 max-w-[80%] shadow-lg transition-transform duration-300 hover:scale-105">
                      <p className="font-medium mb-1 text-xs sm:text-sm opacity-90">
                        AI: Hello! How can
                      </p>
                      <p className="font-medium text-xs sm:text-sm opacity-90">
                        I assist you today?
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6 flex justify-end">
                    <div className="bg-white/95 text-gray-900 rounded-3xl rounded-tr-lg px-4 sm:px-6 py-3 sm:py-4 max-w-[80%] shadow-lg transition-transform duration-300 hover:scale-105">
                      <p className="font-medium text-xs sm:text-sm">Generate a happy</p>
                      <p className="font-medium text-xs sm:text-sm">birthday card</p>
                    </div>
                  </div>

                  <div className="bg-white/95 dark:bg-gray-100 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg transition-all duration-300 hover:shadow-2xl">
                    <input
                      type="text"
                      placeholder="Send a message..."
                      className="flex-grow bg-transparent text-gray-700 placeholder-gray-400 outline-none text-xs sm:text-sm"
                      readOnly
                    />
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 transition-transform duration-300 hover:scale-125"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Cards + Search Bar (70%) */}
        <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="min-h-full flex flex-col p-4 sm:p-6 lg:p-10">
            <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 hover:text-purple-600 dark:hover:text-purple-400">
                  AI Card Generator
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300 hover:text-gray-800 dark:hover:text-gray-200">
                  The fastest way from prompt to Smartcard with AI
                </p>
              </div>

              {/* Cards Grid */}
              {/* Search Bar - AT THE TOP */}
              <div className="mt-2 mb-6 pt-6 pb-4">                           {/* keep mt-auto, used when more cards will be Added */}
                <SearchBar onSearch={handleSearch} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
                {filteredCards.length > 0 ? (
                  filteredCards.map((card) => (
                    <Card
                      key={card.id}
                      icon={card.icon}
                      title={card.title}
                      description={card.description}
                      color={card.color}
                      brandLogo={card.brandLogo}
                      onClick={card.id === 2 ? handleChatClick : undefined}
                      active={card.id === 2 ? showChatPrompt : false}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {`No cards found matching "${searchQuery}"`}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
