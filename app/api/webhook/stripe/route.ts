// app/api/webhook/stripe/route.ts

// CRITICAL: Disable body parsing to preserve raw body for signature verification
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { userStore } from '@/lib/userStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  let body: string;
  try {
    body = await req.text();
  } catch (err) {
    console.error('Failed to read request body:', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Signature verification failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'customer']
        });

        const customer = expandedSession.customer as Stripe.Customer;
        const customerId = customer.id;
        const priceId = expandedSession.line_items?.data[0]?.price?.id;
        const customerEmail = customer.email;

        if (!customerEmail) {
          console.error('No customer email found');
          throw new Error('No customer email');
        }

        const user = userStore.getUserByEmail(customerEmail);

        if (!user) {
          userStore.addUser({
            id: crypto.randomUUID(),
            email: customerEmail,
            password: '',
            name: customer.name || 'Stripe User',
            role: 'user',
            isVerified: true,
            stripeCustomerId: customerId,
            hasAccess: true,
            priceId: priceId || '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          userStore.updateUser(customerEmail, {
            stripeCustomerId: customerId,
            hasAccess: true,
            priceId: priceId || ''
          });
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const user = userStore.getUserByCustomerId(customerId);

        if (user) {
          userStore.updateUser(user.email, { hasAccess: true });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        const user = userStore.getUserByCustomerId(customerId);

        if (user) {
          userStore.updateUser(user.email, {
            priceId: priceId,
            hasAccess: subscription.status === 'active'
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = userStore.getUserByCustomerId(customerId);

        if (user) {
          userStore.updateUser(user.email, { hasAccess: false });
        }

        break;
      }

      case 'billing_portal.session.created':
      case 'customer.updated':
        // Acknowledged but no action needed
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true, processed: event.type }, { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error('Webhook processing failed:', event.type, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
