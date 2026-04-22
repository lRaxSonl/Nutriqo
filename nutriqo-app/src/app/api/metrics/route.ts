import { register } from '@/shared/lib/prometheus';

export const runtime = 'nodejs';

export async function GET() {
  return new Response(await register.metrics(), {
    status: 200,
    headers: {
      'Content-Type': register.contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
