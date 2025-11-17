// components/icons/XLogo.tsx
export function XLogo() {
  return (
    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-black dark:bg-gray-900 rounded-md flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
      <svg 
        viewBox="0 0 24 24" 
        className="w-4 h-4 lg:w-5 lg:h-5 text-white" 
        fill="currentColor"
        aria-label="X Logo"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </div>
  );
}
