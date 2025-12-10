// app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';
import { userStore } from '@/lib/userStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const email = body.email || 'test@example.com';

    const user = userStore.getUserByEmail(email);

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/payment`,
    });

    return NextResponse.json({
      url: portalSession.url,
      sessionId: portalSession.id,
      customerId: portalSession.customer,
    });

  } catch (error) {
    const err = error as Error;
    console.error('Portal creation failed:', err.message);
    
    return NextResponse.json(
      { error: err.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
