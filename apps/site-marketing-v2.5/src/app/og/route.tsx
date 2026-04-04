import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Olcan | Capacitação Internacional';
  const subtitle = searchParams.get('subtitle') ?? 'Sua Carreira Sem Fronteiras';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAF9F6',
          padding: '72px',
          fontFamily: 'serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#E8421A',
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#001338', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            OLCAN
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: Math.min(72, Math.max(40, Math.floor(1400 / title.length))) + 'px',
              fontWeight: 700,
              color: '#001338',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: '26px',
                color: '#001338',
                opacity: 0.6,
                fontWeight: 400,
                fontStyle: 'italic',
                maxWidth: '700px',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', color: '#001338', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            olcan.com.br
          </span>
          <div
            style={{
              backgroundColor: '#E8421A',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Começar Jornada
          </div>
        </div>

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px solid rgba(0,19,56,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '1px solid rgba(0,19,56,0.04)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
