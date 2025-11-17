'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { MessageSquare, Trash2, Plus, X } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
}

export const Sidebar = forwardRef<{ refreshHistory: () => void }, SidebarProps>(
  ({ isOpen, onClose, onNewChat, onSelectChat, currentChatId }, ref) => {
    const [history, setHistory] = useState<ChatHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      loadHistory();
    }, []);

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error('Failed to load history');
        const data = await response.json();

        const uniqueHistory = data.reduce((acc: ChatHistory[], curr: ChatHistory) => {
          const exists = acc.find(item => item.id === curr.id);
          if (!exists) acc.push(curr);
          return acc;
        }, []);
        setHistory(uniqueHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refreshHistory: loadHistory
    }));

    const deleteChat = async (chatId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        const response = await fetch(`/api/history?chatId=${chatId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete');
        setHistory(history.filter(item => item.id !== chatId));
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    };

    const formatDate = (dateString: string) => {
      const now = new Date();
      const chatDate = new Date(dateString);
      const diffInHours = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return 'Today';
      if (diffInHours < 48) return 'Yesterday';
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
      return chatDate.toLocaleDateString();
    };

    const handleChatSelect = (chatId: string) => {
      onSelectChat(chatId);
      onClose();
    };

    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-[280px] sm:w-[320px] 
          bg-[#f4f4f4] dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-700 
          shadow-xl transition-transform duration-300 ease-in-out z-50 flex flex-col 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-black dark:text-white font-semibold text-lg">Chats</h2>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg 
              bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 
              transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Recent Chats
              </h3>

              <div className="space-y-1 mt-2">
                {isLoading ? (
                  <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Loading...
                  </div>
                ) : history.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p>No chats yet</p>
                    <p className="text-xs mt-1 text-gray-400">Start a conversation!</p>
                  </div>
                ) : (
                  history.map((item) => (
  <div key={item.id} className="relative group/item">
    <button
      onClick={() => handleChatSelect(item.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
        currentChatId === item.id
          ? 'bg-gray-500 text-white dark:bg-gray-200 dark:text-black'
          : 'bg-white text-black dark:bg-[#2a2a2a] dark:text-white hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
      }`}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-700 dark:text-gray-300" />
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="truncate text-sm font-medium">{item.title}</div>
        <div className="text-xs text-black dark:text-gray-400 mt-0.5">
          {formatDate(item.timestamp)}
        </div>
      </div>
    </button>
    <button
      onClick={(e) => deleteChat(item.id, e)}
      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 rounded"
      title="Delete"
    >
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
  </div>
))

                  
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-[#f4f4f4] dark:bg-[#1e1e1e]">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Showing {history.length} of 15 chats
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Auto-saved</p>
            </div>
          </div>
        </aside>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';
