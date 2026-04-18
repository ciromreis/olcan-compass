import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by load balancers, Docker, and monitoring systems
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.5.0',
    service: 'olcan-compass-v2.5',
  };

  return NextResponse.json(healthCheck, { status: 200 });
}

// Support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
