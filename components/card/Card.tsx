// components/card/Card.tsx
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
}

export function Card({ icon, title, description, color, onClick, active, brandLogo = 'x' }: CardProps) {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      bgHover: "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
      iconHover: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
      border: "hover:border-blue-400 dark:hover:border-blue-500",
      borderActive: "border-blue-500 dark:border-blue-400",
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
      text: "group-hover:text-green-700 dark:group-hover:text-green-300",
      shadow: "group-hover:shadow-green-200 dark:group-hover:shadow-green-900/50",
    },
  };

  const styles = colorStyles[color];

  // Select brand logo component
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
      onClick={onClick}
      className={`
        relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 lg:p-6
        border-2 transition-all duration-300 ease-in-out
        cursor-pointer group overflow-hidden
        will-change-transform
        ${active 
          ? `${styles.borderActive} shadow-2xl` 
          : `border-gray-200 dark:border-gray-700 ${styles.border} hover:shadow-2xl`
        }
        ${styles.shadow}
        focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700
      `}
      style={{
        minHeight: '180px',
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
      {/* Animated Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

      {/* Brand Logo - Top Right Corner */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 transform transition-transform duration-300 group-hover:scale-110">
        {getBrandLogo()}
      </div>
      
      {/* "eni" Logo - Bottom Right Corner */}
      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10 transform transition-transform duration-300 group-hover:scale-110">
        <EniLogo />
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 relative z-0">
        {/* Icon with Enhanced Hover Effects */}
        <div className={`
          w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 
          ${styles.bg} ${styles.bgHover}
          rounded-xl flex items-center justify-center 
          shadow-md group-hover:shadow-xl 
          transition-all duration-300
          transform group-hover:scale-110
        `}>
          <div className={`
            w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 
            ${styles.icon} ${styles.iconHover}
            transition-all duration-300
          `}>
            {icon}
          </div>
        </div>

        {/* Content with Smooth Transitions */}
        <div className="space-y-1 sm:space-y-2">
          <h3 className={`
            text-sm sm:text-base lg:text-lg 
            font-semibold text-gray-900 dark:text-white 
            transition-colors duration-300 
            ${styles.text}
          `}>
            {title}
          </h3>
          <p className="
            text-xs sm:text-xs lg:text-sm 
            text-gray-600 dark:text-gray-400 
            leading-relaxed line-clamp-2
            transition-colors duration-300
            group-hover:text-gray-800 dark:group-hover:text-gray-200
          ">
            {description}
          </p>
        </div>

        {/* Active Indicator - Fixed Height to Prevent Layout Shift */}
        <div className="h-6 flex items-center">
          {active && (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 animate-fade-in">
              <CheckIcon />
              <span className="text-xs font-medium">Selected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
