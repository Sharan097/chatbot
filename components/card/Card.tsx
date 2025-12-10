// components/card/Card.tsx
"use client";

import { forwardRef } from 'react';
import { 
  XLogo, 
  MetaLogo, 
  AppleLogo, 
  GoogleLogo, 
  MicrosoftLogo, 
  AmazonLogo, 
  NetflixLogo,
  SpotifyLogo,
  EniLogo, 
  CheckIcon 
} from '@/components/icons';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "purple" | "green";
  onClick?: () => void;
  active?: boolean;
  brandLogo?: 'x' | 'meta' | 'apple' | 'google' | 'microsoft' | 'amazon' | 'netflix' | 'spotify';
  isConnected?: boolean;
  previewData?: {
    tweets?: string[];
    trending?: string[];
  };
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ icon, title, description, color, onClick, active, brandLogo = 'x', isConnected, previewData }, ref) => {
    const colorStyles = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        bgHover: "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
        icon: "text-blue-600 dark:text-blue-400",
        iconHover: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
        border: "hover:border-blue-400 dark:hover:border-blue-500",
        borderActive: "border-blue-500 dark:border-blue-400",
        borderConnected: "border-green-500 dark:border-green-400",
        text: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
        shadow: "group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/50",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        bgHover: "group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30",
        icon: "text-purple-600 dark:text-purple-400",
        iconHover: "group-hover:text-purple-700 dark:group-hover:text-purple-300",
        border: "hover:border-purple-400 dark:hover:border-purple-500",
        borderActive: "border-purple-500 dark:border-purple-400",
        borderConnected: "border-green-500 dark:border-green-400",
        text: "group-hover:text-purple-700 dark:group-hover:text-purple-300",
        shadow: "group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/50",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        bgHover: "group-hover:bg-green-100 dark:group-hover:bg-green-900/30",
        icon: "text-green-600 dark:text-green-400",
        iconHover: "group-hover:text-green-700 dark:group-hover:text-green-300",
        border: "hover:border-green-400 dark:hover:border-green-500",
        borderActive: "border-green-500 dark:border-green-400",
        borderConnected: "border-green-500 dark:border-green-400",
        text: "group-hover:text-green-700 dark:group-hover:text-green-300",
        shadow: "group-hover:shadow-green-200 dark:group-hover:shadow-green-900/50",
      },
    };

    const styles = colorStyles[color];

    const getBrandLogo = () => {
      switch (brandLogo) {
        case 'meta': return <MetaLogo />;
        case 'apple': return <AppleLogo />;
        case 'google': return <GoogleLogo />;
        case 'microsoft': return <MicrosoftLogo />;
        case 'amazon': return <AmazonLogo />;
        case 'netflix': return <NetflixLogo />;
        case 'spotify': return <SpotifyLogo />;
        default: return <XLogo />;
      }
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          relative bg-white dark:bg-gray-800 rounded-3xl
          border-2 transition-all duration-300 ease-in-out
          cursor-pointer group overflow-hidden
          will-change-transform
          aspect-[1/1.1]
          ${isConnected
            ? `${styles.borderConnected} shadow-2xl ring-2 ring-green-400/50 dark:ring-green-500/50`
            : active 
              ? `${styles.borderActive} shadow-2xl` 
              : `border-gray-200 dark:border-gray-700 ${styles.border} hover:shadow-2xl`
          }
          ${styles.shadow}
          focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700
        `}
        style={{
          transform: active ? 'translateY(-4px)' : 'translateY(0)',
        }}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

        {/* Connected Badge */}
        {isConnected && (
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-fade-in">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              Connected
            </div>
          </div>
        )}

        {/* Brand Logo - Top Right */}
        <div className="absolute top-3 right-3 z-10 transform transition-transform duration-300 group-hover:scale-110">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            {getBrandLogo()}
          </div>
        </div>
        
        {/* Eni Logo - Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10 transform transition-transform duration-300 group-hover:scale-110">
          <EniLogo />
        </div>

        {/* Scrollable Content Container */}
        <div className="h-full flex flex-col p-5 overflow-y-auto custom-scrollbar">
          {/* Icon */}
          <div className={`
            w-16 h-16
            ${styles.bg} ${styles.bgHover}
            rounded-2xl flex items-center justify-center 
            shadow-md group-hover:shadow-xl 
            transition-all duration-300
            transform group-hover:scale-105
            flex-shrink-0
            mb-4
          `}>
            <div className={`
              w-9 h-9
              ${styles.icon} ${styles.iconHover}
              transition-all duration-300
            `}>
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className={`
              text-lg font-bold text-gray-900 dark:text-white 
              transition-colors duration-300 
              ${styles.text}
              leading-tight
            `}>
              {title}
            </h3>
            <p className="
              text-sm
              text-gray-600 dark:text-gray-400 
              leading-snug
              transition-colors duration-300
              group-hover:text-gray-800 dark:group-hover:text-gray-200
            ">
              {description}
            </p>
          </div>

          {/* Preview Data for Connected Cards */}
          {isConnected && previewData && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2.5 text-xs text-gray-600 dark:text-gray-400 animate-fade-in">
              {previewData.tweets && previewData.tweets.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-[10px] uppercase tracking-wide">Latest Tweet:</p>
                  <p className="line-clamp-2 italic text-[11px] leading-relaxed">{previewData.tweets[0]}</p>
                </div>
              )}
              {previewData.trending && previewData.trending.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {previewData.trending.slice(0, 3).map((trend, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-semibold">
                      {trend}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-gray-500 dark:text-gray-500 italic pt-1">
                Click to view full dashboard →
              </p>
            </div>
          )}

          {/* Active Indicator - Only show if NOT connected */}
          {!isConnected && active && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 animate-fade-in">
                <CheckIcon />
                <span className="text-xs font-semibold">Selected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

