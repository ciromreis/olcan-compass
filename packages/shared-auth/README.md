# @olcan/shared-auth

Unified authentication service for the Olcan Compass ecosystem.

## Features

- ✅ Single JWT token across all apps
- ✅ React hooks for easy integration
- ✅ Next.js middleware for route protection
- ✅ Automatic token refresh
- ✅ Role-based access control
- ✅ MedusaJS marketplace sync
- ✅ TypeScript support

## Installation

This package is part of the Olcan monorepo and uses pnpm workspaces.

```bash
# In your app's package.json
{
  "dependencies": {
    "@olcan/shared-auth": "workspace:*"
  }
}
```

## Usage

### React Hooks

```tsx
// app/layout.tsx
import { AuthProvider } from '@olcan/shared-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider apiUrl={process.env.NEXT_PUBLIC_API_URL}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// app/dashboard/page.tsx
'use client';

import { useAuth, useUser } from '@olcan/shared-auth/react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.full_name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Next.js Middleware

```ts
// middleware.ts
import { withAuth } from '@olcan/shared-auth/next';

export default withAuth({
  protectedRoutes: ['/dashboard/*', '/profile', '/settings'],
  publicOnlyRoutes: ['/login', '/register'],
  loginUrl: '/login',
  dashboardUrl: '/dashboard',
  roleBasedAccess: {
    '/admin/*': ['admin'],
    '/vendor/*': ['vendor', 'admin'],
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*', '/vendor/:path*'],
};
```

### Core Service

```ts
import { authService } from '@olcan/shared-auth';

// Login
const user = await authService.login('user@example.com', 'password');

// Register
const newUser = await authService.register('user@example.com', 'password', 'Full Name');

// Get current user
const currentUser = await authService.getCurrentUser();

// Logout
await authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();

// Get token for API calls
const token = authService.getToken();
const headers = authService.getAuthHeaders();
```

## Available Hooks

### `useAuth()`
Returns authentication state and methods.

```tsx
const { user, isAuthenticated, isLoading, login, register, logout, refreshUser } = useAuth();
```

### `useUser()`
Returns current user or null.

```tsx
const user = useUser();
```

### `useIsAuthenticated()`
Returns boolean indicating if user is logged in.

```tsx
const isAuthenticated = useIsAuthenticated();
```

### `useSession()`
Returns session information with loading state.

```tsx
const { user, isLoading, isAuthenticated, refresh } = useSession();
```

### `useHasRole(role)`
Check if user has specific role.

```tsx
const isAdmin = useHasRole('admin');
```

### `useHasAnyRole(roles)`
Check if user has any of the specified roles.

```tsx
const canAccessVendor = useHasAnyRole(['vendor', 'admin']);
```

## Middleware Helpers

### `requireAuth(request)`
Protect API routes - throws if not authenticated.

```ts
// app/api/protected/route.ts
import { requireAuth } from '@olcan/shared-auth/next';

export async function GET(request: Request) {
  const user = await requireAuth(request);
  // ... rest of handler
}
```

### `requireRole(request, roles)`
Protect API routes with role check.

```ts
import { requireRole } from '@olcan/shared-auth/next';

export async function POST(request: Request) {
  await requireRole(request, ['admin', 'vendor']);
  // ... rest of handler
}
```

## Token Refresh

Automatic token refresh is built-in. To enable:

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { authService } from '@olcan/shared-auth';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Refresh token every 10 minutes
    authService.startTokenRefresh(10);
  }, []);
  
  return <AuthProvider>{children}</AuthProvider>;
}
```

## Architecture

### Token Storage
- Access token: `localStorage.olcan_access_token`
- Refresh token: `localStorage.olcan_refresh_token`
- Cookie: `olcan_access_token` (for SSR)

### Token Format
JWT with payload:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|admin|vendor",
  "exp": 1234567890
}
```

### Service Integration

```
┌─────────────────────────────────────────┐
│      @olcan/shared-auth                 │
│      Single JWT Token                   │
└─────────────────────────────────────────┘
                  ↓
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
┌─────────┐  ┌─────────┐  ┌──────────┐
│ App v2.5│  │Marketing│  │ MedusaJS │
│ (3000)  │  │ (3001)  │  │ (9000)   │
└─────────┘  └─────────┘  └──────────┘
    ↓             ↓             ↓
┌─────────────────────────────────────────┐
│      FastAPI Backend (8001)             │
│      JWT Validation & User Management   │
└─────────────────────────────────────────┘
```

## Role-Based Access

### Roles
- `user` - Regular user (default)
- `vendor` - Marketplace vendor
- `admin` - System administrator

### Role Mapping
- `user` → Can access app features
- `vendor` → Can access app + vendor portal
- `admin` → Can access everything + admin panel

## MedusaJS Integration

User sync happens automatically on login/register:
1. User logs in via FastAPI
2. JWT token issued
3. Customer created in MedusaJS (if doesn't exist)
4. Token valid for both services

## Development

```bash
# Build package
cd packages/shared-auth
pnpm build

# Watch mode
pnpm dev

# Clean build
pnpm clean && pnpm build
```

## Environment Variables

Required in consuming apps:

```bash
# App v2.5
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_MARKETPLACE_API_URL=http://localhost:9000

# Marketing Site
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
```

## Migration Guide

### From app-compass-v2.5 auth store

**Before:**
```tsx
import { useAuthStore } from '@/stores/auth';

const { user, login, logout } = useAuthStore();
```

**After:**
```tsx
import { useAuth } from '@olcan/shared-auth/react';

const { user, login, logout } = useAuth();
```

### From Supabase middleware

**Before:**
```ts
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

**After:**
```ts
import { withAuth } from '@olcan/shared-auth/next';

export default withAuth({
  protectedRoutes: ['/dashboard/*'],
  publicOnlyRoutes: ['/login'],
});
```

## Troubleshooting

### Token not persisting
- Check localStorage is available (not in SSR context)
- Verify CORS allows credentials
- Check cookie settings in production

### 401 Unauthorized
- Token may be expired - call `refreshToken()`
- Check JWT_SECRET matches across services
- Verify token format in Authorization header

### Role-based access not working
- Check user role is set correctly in JWT payload
- Verify middleware config includes route pattern
- Check role comparison is case-sensitive

## License

Private - Olcan Compass Project
