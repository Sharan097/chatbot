// app/chatbot/page.tsx
"use client";

import AIChat from "@/components/ai-chat";
import { useSession } from "next-auth/react";

export default function ChatbotPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AIChat />;
}
