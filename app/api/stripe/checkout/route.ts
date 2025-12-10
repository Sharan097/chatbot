// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    console.log('Creating checkout session for:', session.user.email);
    console.log('Price ID:', priceId);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment?canceled=true`,
      metadata: {
        userEmail: session.user.email,
      },
    });

    console.log('Checkout session created:', checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const err = error as Error;
    console.error('Checkout error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
