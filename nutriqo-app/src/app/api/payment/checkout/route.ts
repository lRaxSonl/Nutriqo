import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createCheckoutSession } from '@/features/payment/lib/createCheckoutSession';

export async function POST() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const checkoutUrl = await createCheckoutSession(session.user.id, session.user.email);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}