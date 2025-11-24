// app/page.tsx
"use client";

import { useState, KeyboardEvent } from "react";
// import { useSession } from "next-auth/react";
import { useSession, signOut } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Search, LogOut } from "lucide-react";
import { Button } from '@/components/ui/button';
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

// Chat message type
type ChatMessage = {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [filteredCards, setFilteredCards] = useState(cardData);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      text: 'Hello! How can I assist you today?',
      timestamp: new Date()
    }
  ]);


  // LOGOUT FUNCTION ADDED HERE
  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };


  const handleChatClick = () => {
    setShowChatPrompt(!showChatPrompt);
  };

  const handleStartChatting = () => {
    router.push("/chatbot");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
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

  // Handle chatbot message send
  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const lowerQuery = chatInput.toLowerCase();
      const matchedCards = cardData.filter(card => 
        card.title.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery) ||
        card.keywords.some(keyword => keyword.includes(lowerQuery))
      );

      let aiResponse = '';
      if (matchedCards.length > 0) {
        const cardTitles = matchedCards.map(c => c.title).join(', ');
        aiResponse = `I found ${matchedCards.length} card(s) related to your query: ${cardTitles}. Check the right side to see them!`;
        setFilteredCards(matchedCards);
      } else {
        aiResponse = `I couldn't find any cards matching "${chatInput}". Try searching for: AI Engine, Create Cards, View Cards, Templates, or Export.`;
        setFilteredCards(cardData);
      }

      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 500);

    setChatInput("");
  };

  // Handle Enter key press
  const handleChatKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChatSend();
    }
  };

    if (status === "loading") {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Modern Minimalist Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 dark:border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading AI Card Generator</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Preparing your experience...</p>
          </div>
        </div>
      </div>
      );
    }


  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900">

    {/* LOGOUT BUTTON */}
        <div className="absolute top-4 right-4 z-50">
          <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-black hover:bg-gray-100 flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
        </div>


      <div className="w-full h-screen grid grid-cols-1 lg:grid-cols-[30%_70%]">
        
        {/* Left Section - Interactive Chatbot (30%) */}
        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-pink-200/50 to-orange-200/50 dark:from-purple-800/30 dark:via-pink-800/30 dark:to-orange-800/30 blur-3xl opacity-60"></div>

          <div className="max-w-md w-full h-full flex flex-col justify-between relative z-10">
            {showChatPrompt ? (
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
              <div className="w-full h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    AI Assistant
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Ask me to find cards for you
                  </p>
                </div>

                {/* Chat Messages Container */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[85%] px-4 py-3 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02]
                          ${message.type === 'user'
                            ? 'bg-white/95 text-gray-900 rounded-tr-lg'
                            : 'bg-blue-500 text-white rounded-tl-lg'
                          }
                        `}
                      >
                        <p className="text-xs sm:text-sm font-medium break-words">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input - Polished Search Bar */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900/50">
                    <div className="pl-4 text-gray-400 dark:text-gray-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Type here for cards..."
                      className="flex-grow py-3 px-2 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none text-sm sm:text-base focus:outline-none focus:ring-0 border-0"
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim()}
                      className="mr-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                      title="Search"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Cards (70%) */}
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
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredCards(cardData);
                        setChatMessages(prev => [...prev, {
                          id: prev.length + 1,
                          type: 'ai',
                          text: 'Showing all cards again!',
                          timestamp: new Date()
                        }]);
                      }}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
    </div>
  );
}
