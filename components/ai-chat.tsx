'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { MenuIcon, GlobeIcon, LogOut, Send, Paperclip, Copy, RefreshCw, Check, X, FileIcon, ThumbsUp, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import { Sidebar } from './app-sidebar';
import { Button } from '@/components/ui/button';

const generateSimpleId = () => Math.random().toString(36).substring(2, 15);

const models = [
  { name: 'Gemini 2.5 Flash', value: 'gemini' },
  { name: 'DeepSeek V3 (Free)', value: 'deepseek/deepseek-v3-free' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  vote?: 'up' | 'down' | null;
  model?: string;
}

interface FilePreview {
  url: string;
  name: string;
  type: string;
  size: number;
}

const AIChat = () => {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [chatId, setChatId] = useState(() => generateSimpleId());
  const [currentChatTitle, setCurrentChatTitle] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const hasSavedHistory = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<{ refreshHistory: () => void }>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const debouncedSave = useCallback((id: string, title: string, msgs: Message[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          chatId: id,
          title,
          timestamp: new Date().toISOString(),
          messages: msgs,
        };

        const res = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.debounced) {
            sidebarRef.current?.refreshHistory();
          }
        }
      } catch (err) {
        console.error('Failed to save history:', err);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const hasUser = messages.some(m => m.role === 'user');
    const hasAssistant = messages.some(m => m.role === 'assistant');

    if (hasUser && hasAssistant) {
      if (!hasSavedHistory.current) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg) {
          const title = firstUserMsg.content.substring(0, 50) + 
                       (firstUserMsg.content.length > 50 ? '...' : '');
          setCurrentChatTitle(title);
          hasSavedHistory.current = true;
        }
      }

      if (currentChatTitle || hasSavedHistory.current) {
        debouncedSave(chatId, currentChatTitle, messages);
      }
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [messages, chatId, currentChatTitle, debouncedSave]);

  const handleNewChat = async () => {
    console.log('Creating new chat...');
    
    if (messages.length > 0 && currentChatTitle) {
      console.log('Saving current chat before creating new one...');
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            title: currentChatTitle,
            timestamp: new Date().toISOString(),
            messages,
          }),
        });
        console.log('Current chat saved');
      } catch (err) {
        console.error('Failed to save current chat:', err);
      }
    }

    const newChatId = generateSimpleId();
    console.log('New chat ID:', newChatId);
    
    setChatId(newChatId);
    setMessages([]);
    setInput('');
    setCurrentChatTitle('');
    setUploadedFileUrl('');
    setFilePreview(null);
    hasSavedHistory.current = false;

    setTimeout(() => {
      sidebarRef.current?.refreshHistory();
      console.log('Sidebar refreshed');
    }, 500);
  };

  const handleSelectChat = async (selectedChatId: string) => {
    console.log('Loading chat:', selectedChatId);
    
    try {
      if (messages.length > 0 && currentChatTitle && chatId !== selectedChatId) {
        console.log('Saving current chat before switching...');
        
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            title: currentChatTitle,
            timestamp: new Date().toISOString(),
            messages,
          }),
        });
      }

      const res = await fetch(`/api/history?chatId=${selectedChatId}`);
      if (!res.ok) throw new Error('Failed to load chat');
      
      const data = await res.json();
      console.log('Chat loaded:', data.title);
      
      setChatId(selectedChatId);
      setCurrentChatTitle(data.title);
      setMessages(data.messages || []);
      hasSavedHistory.current = true;
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const localUrl = URL.createObjectURL(file);
      setFilePreview({
        url: localUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      console.log('Uploading file:', file.name);

      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const blob = await response.json();
      setUploadedFileUrl(blob.url);
      
      setFilePreview({
        url: blob.url,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      console.log('File uploaded:', blob.url);
    } catch (error) {
      const err = error as Error;
      console.error('Upload error:', err);
      alert('Failed to upload file. Please try again.');
      setFilePreview(null);
      setUploadedFileUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFilePreview = () => {
    setFilePreview(null);
    setUploadedFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyToClipboard = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      console.log('Copied to clipboard');
      
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleVote = async (messageId: string, voteType: 'up' | 'down') => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      console.log(`Voting ${voteType} for message ${messageId}`);

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          chatId,
          vote: voteType,
          messageContent: message.content,
          model: message.model || model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record vote');
      }

      const data = await response.json();

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, vote: data.vote }
          : msg
      ));

      console.log(`Vote ${voteType} recorded`);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleRegenerate = async (messageId: string, messageIndex: number) => {
    console.log('Regenerating response for message:', messageId);
    
    setRegeneratingMessageId(messageId);

    try {
      const messagesUpToRegenerate = messages.slice(0, messageIndex);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesUpToRegenerate,
          model,
          webSearch,
          chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to regenerate response');
      }

      const data = await response.json();

      if (!data.content) {
        throw new Error('Empty response from AI');
      }

      const newMessages = [...messages];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content: data.content,
        timestamp: new Date().toISOString(),
        model: data.model,
        vote: null,
      };

      setMessages(newMessages);
      console.log('Response regenerated');

    } catch (error) {
      const err = error as Error;
      console.error('Error regenerating:', err);
      
      const errorMessage: Message = {
        id: generateSimpleId(),
        role: 'assistant',
        content: `Failed to regenerate: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      
      const newMessages = [...messages];
      newMessages[messageIndex] = errorMessage;
      setMessages(newMessages);
    } finally {
      setRegeneratingMessageId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateSimpleId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      fileUrl: uploadedFileUrl || undefined,
      fileName: filePreview?.name,
      fileType: filePreview?.type,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFileUrl('');
    setFilePreview(null);
    setIsLoading(true);

    try {
      console.log('Sending message to API...');
      console.log('Model:', model);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model,
          webSearch,
          chatId,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      console.log('Response received');

      if (!data.content) {
        throw new Error('Empty response from AI');
      }

      const assistantMessage: Message = {
        id: generateSimpleId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        model: data.model || model,
        vote: null,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const err = error as Error;
      console.error('Error in handleSubmit:', err);
      
      const errorMessage: Message = {
        id: generateSimpleId(),
        role: 'assistant',
        content: err.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ 
      callbackUrl: '/login',
      redirect: true 
    });
  };

  const renderFileAttachment = (fileUrl: string, fileName?: string, fileType?: string) => {
    const isImage = fileType?.startsWith('image/');
    const isVideo = fileType?.startsWith('video/');

    if (isImage) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-[#e5e5e5] relative" style={{ maxHeight: '300px', maxWidth: '100%' }}>
          <Image 
            src={fileUrl} 
            alt={fileName || 'Attached image'} 
            width={500}
            height={300}
            className="object-cover"
            style={{ maxHeight: '300px', width: 'auto' }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-[#e5e5e5]">
          <video 
            src={fileUrl} 
            controls 
            className="w-full max-w-md"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="mt-2 p-3 bg-white rounded-lg border border-[#e5e5e5] flex items-center gap-2">
        <FileIcon size={16} className="text-gray-600" />
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-black underline hover:text-gray-600"
        >
          {fileName || 'Attached file'}
        </a>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar
        ref={sidebarRef}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={chatId}
      />

      <div className="flex flex-col flex-1 h-screen bg-white overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-30 w-full bg-white border-b border-[#e5e5e5] shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="w-5 h-5 text-black" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-black">AI Chat</h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              {session?.user && (
                <span className="text-xs sm:text-sm text-black hidden sm:block truncate max-w-[150px]">
                  {session.user.email}
                </span>
              )}
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-white mt-14 sm:mt-16">
          <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-12 sm:mt-20">
                <div className="mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#e5e5e5]">
                    <span className="text-2xl sm:text-3xl">💬</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-black">Start a Conversation</h2>
                <p className="text-sm sm:text-base text-gray-500">Type a message below to begin chatting with AI</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[80%] break-words ${
                      msg.role === 'user'
                        ? 'bg-black text-white'
                        : 'bg-[#f2f2f2] text-black border border-[#e5e5e5]'
                    }`}
                  >
                    {regeneratingMessageId === msg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
                        {msg.fileUrl && renderFileAttachment(msg.fileUrl, msg.fileName, msg.fileType)}
                      </>
                    )}
                  </div>
                </div>

                {msg.role === 'assistant' && regeneratingMessageId !== msg.id && (
                  <div className="flex items-center gap-2 mt-2 ml-2">
                    <button
                      onClick={() => handleVote(msg.id, 'up')}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all ${
                        msg.vote === 'up'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title="Good response"
                    >
                      <ThumbsUp size={12} className={msg.vote === 'up' ? 'fill-current' : ''} />
                    </button>

                    <button
                      onClick={() => handleVote(msg.id, 'down')}
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all ${
                        msg.vote === 'down'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Bad response"
                    >
                      <ThumbsDown size={12} className={msg.vote === 'down' ? 'fill-current' : ''} />
                    </button>

                    <button
                      onClick={() => handleCopyToClipboard(msg.id, msg.content)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-all"
                      title="Copy to clipboard"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check size={12} className="text-green-600" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>

                    <button
                      onClick={() => handleRegenerate(msg.id, index)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-all"
                      title="Regenerate response"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f2f2f2] border border-[#e5e5e5] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="border-t border-[#e5e5e5] bg-white p-3 sm:p-4 shadow-lg">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {filePreview && (
              <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-[#e5e5e5] flex items-center gap-2 sm:gap-3">
                {filePreview.type.startsWith('image/') ? (
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border border-[#e5e5e5]">
                    <Image 
                      src={filePreview.url} 
                      alt={filePreview.name} 
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded bg-gray-200 flex items-center justify-center border border-[#e5e5e5]">
                    <FileIcon size={20} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-black truncate">{filePreview.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{(filePreview.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={removeFilePreview}
                  className="p-1 hover:bg-gray-200 rounded transition"
                  disabled={isUploading}
                >
                  <X size={14} className="text-gray-600" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <button
                type="button"
                onClick={() => setWebSearch(!webSearch)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 
                            border rounded-xl text-sm font-medium shadow-sm transition-all 
                            ${webSearch
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-[#333333] border-gray-300 hover:bg-black hover:text-white hover:border-black'
                            } focus:outline-none focus:ring-2 focus:ring-black`}
              >
                <GlobeIcon size={16} className="sm:w-4 sm:h-4" />
                <span>Search</span>
              </button>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border border-gray-300 bg-white text-black rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 
                           text-sm font-medium shadow-sm transition-all cursor-pointer 
                           hover:bg-black hover:text-white hover:border-black 
                           focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
                           w-44 sm:w-52"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm focus-within:shadow-md transition-all duration-200">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
                title="Attach file"
              >
                {isUploading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip size={18} className="sm:w-5 sm:h-5 text-gray-700" />
                )}
              </button>

              <input
                type="text"
                placeholder="Send a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 px-2 sm:px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading || isUploading}
                className="bg-black text-white p-2 sm:p-2.5 rounded-xl hover:bg-gray-900 active:scale-95 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                title="Send message"
              >
                <Send size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default AIChat;
