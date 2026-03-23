import { NextResponse } from 'next/server';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json(
    {
      status: 'ok',
      timestamp,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    },
    { status: 200 }
  );
}
