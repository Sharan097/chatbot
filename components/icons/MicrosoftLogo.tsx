// components/icons/MicrosoftLogo.tsx
export function MicrosoftLogo() {
  return (
    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-gray-800 dark:bg-gray-700 rounded-md flex items-center justify-center shadow-md hover:shadow-lg transition-shadow opacity-70 hover:opacity-90">
      <svg 
        viewBox="0 0 24 24" 
        className="w-4 h-4 lg:w-5 lg:h-5 text-white" 
        fill="currentColor"
        aria-label="Microsoft Logo"
      >
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
      </svg>
    </div>
  );
}
