const http = require('http');

function request({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode || 0, body: data });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const apiBase = process.env.API_BASE || 'http://localhost:8000/api';
  const email = process.env.SMOKE_EMAIL || 'smoke.user@example.com';
  const password = process.env.SMOKE_PASSWORD || 'SmokeTest1';
  const fullName = process.env.SMOKE_FULL_NAME || 'Smoke User';

  console.log('[auth smoke] API_BASE=', apiBase);
  console.log('[auth smoke] email=', email);

  const health = await request({ method: 'GET', url: `${apiBase}/health` });
  if (health.status !== 200) {
    console.error('[auth smoke] FAIL health', health.status, health.body);
    process.exit(1);
  }
  console.log('[auth smoke] OK health');

  const registerRes = await request({
    method: 'POST',
    url: `${apiBase}/auth/register`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (registerRes.status === 201) {
    console.log('[auth smoke] OK register');
  } else {
    console.log('[auth smoke] register status=', registerRes.status);
    console.log('[auth smoke] register body=', registerRes.body);
  }

  const loginRes = await request({
    method: 'POST',
    url: `${apiBase}/auth/login`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.status !== 200) {
    console.error('[auth smoke] FAIL login', loginRes.status, loginRes.body);
    process.exit(1);
  }

  const loginData = JSON.parse(loginRes.body);
  if (!loginData?.token?.access_token) {
    console.error('[auth smoke] FAIL login missing token', loginRes.body);
    process.exit(1);
  }

  console.log('[auth smoke] OK login');

  const forgotRes = await request({
    method: 'POST',
    url: `${apiBase}/auth/forgot-password`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (forgotRes.status !== 200) {
    console.error('[auth smoke] FAIL forgot-password', forgotRes.status, forgotRes.body);
    process.exit(1);
  }

  const forgotData = JSON.parse(forgotRes.body);
  console.log('[auth smoke] OK forgot-password');
  if (forgotData.reset_url) {
    console.log('[auth smoke] reset_url=', forgotData.reset_url);
  } else {
    console.log('[auth smoke] reset_url not provided');
    console.log('[auth smoke] hint: this is expected when API is running with ENV=production');
    console.log('[auth smoke] hint: for local dev, set ENV=development in apps/api/.env (not committed) and restart the API');
  }

  console.log('[auth smoke] DONE');
}

main().catch((err) => {
  console.error('[auth smoke] ERROR', err);
  process.exit(1);
});
