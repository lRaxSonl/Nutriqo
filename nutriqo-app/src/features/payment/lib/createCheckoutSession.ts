import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function createCheckoutSession(userId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'NutriQo Premium' },
          unit_amount: 999, // $9.99
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/profile?canceled=true`,
    customer_email: email,
    metadata: { userId },
  });

  return session.url;
}