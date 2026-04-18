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

  // Deterministic defaults so you always know what to type on the login screen
  const email = process.env.SEED_EMAIL || 'compass.tester@example.com';
  const password = process.env.SEED_PASSWORD || 'CompassTest1';
  const fullName = process.env.SEED_FULL_NAME || 'Compass Tester';

  console.log('[seed:user] API_BASE=', apiBase);

  const health = await request({ method: 'GET', url: `${apiBase}/health` });
  if (health.status !== 200) {
    console.error('[seed:user] FAIL health', health.status, health.body);
    process.exit(1);
  }

  const registerRes = await request({
    method: 'POST',
    url: `${apiBase}/auth/register`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (registerRes.status === 201) {
    console.log('[seed:user] OK register (created)');
  } else if (registerRes.status === 409 || registerRes.status === 400) {
    // 409 is typical for already exists; some backends return 400 with "Email já cadastrado"
    console.log('[seed:user] register skipped (already exists or invalid):', registerRes.status);
  } else {
    console.log('[seed:user] register status=', registerRes.status);
    console.log('[seed:user] register body=', registerRes.body);
  }

  const loginRes = await request({
    method: 'POST',
    url: `${apiBase}/auth/login`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.status !== 200) {
    console.error('[seed:user] FAIL login', loginRes.status, loginRes.body);
    process.exit(1);
  }

  const loginData = JSON.parse(loginRes.body);
  if (!loginData?.token?.access_token) {
    console.error('[seed:user] FAIL login missing token', loginRes.body);
    process.exit(1);
  }

  console.log('[seed:user] OK login');
  console.log('');
  console.log('===== TEST CREDENTIALS =====');
  console.log('Email:    ', email);
  console.log('Password: ', password);
  console.log('============================');
}

main().catch((err) => {
  console.error('[seed:user] ERROR', err);
  process.exit(1);
});
