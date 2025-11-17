// components/search/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Mic, MicOff, Send } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search your smart cards" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);
  const [micError, setMicError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // ✅ FIX: Type assertion instead of 'any'
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || 
        window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        setIsMicSupported(true);
        try {
          const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
          recognitionRef.current = recognition;
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            onSearch(transcript);
            setIsListening(false);
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'network' && event.error !== 'aborted') {
              console.warn('Speech recognition error:', event.error);
            }
            
            setIsListening(false);
            
            switch (event.error) {
              case 'not-allowed':
              case 'service-not-allowed':
                setMicError('Microphone access denied. Please enable microphone permissions.');
                setTimeout(() => setMicError(""), 4000);
                break;
              case 'no-speech':
                setMicError('No speech detected. Please try again.');
                setTimeout(() => setMicError(""), 3000);
                break;
              case 'audio-capture':
                setMicError('No microphone found. Please connect a microphone.');
                setTimeout(() => setMicError(""), 3000);
                break;
              case 'network':
              case 'aborted':
                break;
              default:
                setMicError('Speech recognition failed. Please try again.');
                setTimeout(() => setMicError(""), 3000);
            }
          };

          recognition.onend = () => setIsListening(false);
          recognition.onstart = () => setIsListening(true);
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setIsMicSupported(false);
        }
      }
    }
  }, [onSearch]);

  const handleMicClick = () => {
    if (!isMicSupported) {
      setMicError('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      setTimeout(() => setMicError(""), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMicError("");
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.warn('Failed to start speech recognition:', error);
        setMicError('Failed to start voice input. Please try again.');
        setTimeout(() => setMicError(""), 3000);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === "") {
      onSearch("");
    }
  };

  return (
    <div className="w-full space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center gap-2
          bg-white dark:bg-gray-800 
          border-2 rounded-xl
          shadow-lg hover:shadow-xl
          transition-all duration-300
          ${isListening 
            ? 'border-red-500 dark:border-red-400 ring-4 ring-red-200 dark:ring-red-900/50' 
            : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
          }
        `}>
          <div className="pl-4 text-gray-400 dark:text-gray-500">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={isListening ? "Listening..." : placeholder}
            className="
              flex-grow py-3 px-2
              bg-transparent text-gray-900 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              outline-none
              text-sm sm:text-base
              focus:ring-0 
              focus:outline-none
              focus:border-transparent
            "
            disabled={isListening}
          />

          {isMicSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`
                p-2 rounded-lg transition-all duration-300
                ${isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              title={isListening ? "Stop recording" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!searchQuery.trim() || isListening}
            className="
              mr-2 p-2 rounded-lg
              bg-purple-600 text-white
              hover:bg-purple-700 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
              shadow-md hover:shadow-lg
            "
            title="Search"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {micError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
            {micError}
          </p>
        </div>
      )}

      {isListening && (
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 animate-fade-in">
          <div className="flex gap-1">
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-xs sm:text-sm font-medium">Listening...</span>
        </div>
      )}
    </div>
  );
}
