import { NextResponse } from 'next/server';

/**
 * Readiness Check Endpoint
 * Indicates if the application is ready to serve traffic
 * Used by Kubernetes and other orchestration systems
 */
export async function GET() {
  try {
    // Check if critical dependencies are available
    // In a real app, you might check database connectivity, etc.
    
    const readinessCheck = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'ok',
        // Add more checks as needed:
        // database: await checkDatabase(),
        // cache: await checkCache(),
      },
    };

    return NextResponse.json(readinessCheck, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
