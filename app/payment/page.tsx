// app/payment/page.tsx
import ButtonCustomerPortal from '@/components/ButtonCustomerPortal';
import Pricing from '@/components/Pricing';
import Link from 'next/link';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          {/* Back to Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Home</span>
          </Link>

          {/* Manage Billing */}
          <ButtonCustomerPortal />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <Pricing />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm">
        <p>Secure payment powered by Stripe</p>
        <p className="mt-2">All transactions are encrypted and secure</p>
      </footer>
    </div>
  );
}
