// components/Pricing.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Monthly',
    price: 19,
    duration: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_test',
    features: [
      'AI Card Generation',
      'Chat History',
      'Template Access',
      'Export & Share',
      '24/7 Support'
    ]
  },
  {
    name: 'Yearly',
    price: 99,
    duration: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_test',
    discount: '60% OFF',
    features: [
      'Everything in Monthly',
      'Priority Support',
      'Early Access Features',
      'Advanced Templates',
      'API Access'
    ]
  }
];

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    console.log('Starting checkout for price:', priceId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        console.log('Redirecting to Stripe checkout');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-purple-600 font-semibold mb-4">PRICING</p>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start creating AI-powered cards today
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
              selectedPlan.name === plan.name
                ? 'border-purple-600'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.discount && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {plan.discount}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {plan.duration}
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
