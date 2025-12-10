// components/ButtonCustomerPortal.tsx
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';

// Hardcoded test email for development
const TEST_EMAIL = 'test@example.com';

// Customer portal direct link
const customerPortalLink = 'https://billing.stripe.com/p/login/test_fZudR92sC5Oc5LV940fUQ00';

export default function ButtonCustomerPortal() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    console.log('[FRONTEND] User clicked Manage Billing');
    console.log('[FRONTEND] Email:', TEST_EMAIL);

    try {
      console.log('[FRONTEND] Calling /api/stripe/portal...');
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL }),
      });

      console.log('[FRONTEND] Response status:', response.status);

      const data = await response.json();
      console.log('[FRONTEND] Response data:', data);

      if (data.url) {
        console.log('[FRONTEND] Portal URL received:', data.url);
        console.log('[FRONTEND] Redirecting to Stripe Portal...');
        window.location.href = data.url;
      } else {
        console.error('[FRONTEND] No portal URL in response');
        alert('No subscription found for this account');
      }
    } catch (error) {
      console.error('[FRONTEND] Portal request failed:', error);
      alert('Failed to open billing portal. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // If user is authenticated
  if (status === 'authenticated') {
    return (
      <button
        onClick={handleManageBilling}
        disabled={loading}
        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 font-medium text-sm border border-purple-300 dark:border-purple-700 flex items-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </>
        ) : (
          'Manage Billing'
        )}
      </button>
    );
  }

  // If not authenticated, show login button
  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
    >
      Login
    </button>
  );
}
