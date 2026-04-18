# Netlify Deployment Fix - styled-jsx Error

**Date**: March 11, 2026  
**Issue**: `Cannot find module 'styled-jsx/style'` runtime error on Netlify  
**Status**: ✅ Fixed

## Problem

The Next.js app (web-v2) was failing on Netlify with:
```
Runtime.ImportModuleError - Error: Cannot find module 'styled-jsx/style'
```

This happens because:
1. pnpm monorepo with `shamefully-hoist=false` doesn't hoist `styled-jsx` to root
2. Netlify's serverless functions can't find the nested dependency
3. Next.js 14.2.35 requires `styled-jsx` to be accessible at runtime

## Solution Applied

### 1. Updated `.npmrc` (Root)
```ini
shamefully-hoist=true
strict-peer-dependencies=false
public-hoist-pattern[]=*styled-jsx*
```

This ensures `styled-jsx` is hoisted to the root `node_modules`.

### 2. Created `apps/web-v2/.npmrc`
```ini
shamefully-hoist=true
public-hoist-pattern[]=*styled-jsx*
public-hoist-pattern[]=*next*
```

Local override for web-v2 to ensure Next.js dependencies are properly hoisted.

### 3. Updated `netlify.toml`
```toml
[build]
  command = "pnpm install --shamefully-hoist && pnpm build:v2"
  publish = "apps/web-v2/.next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--shamefully-hoist"
  NEXT_PUBLIC_API_URL = "https://olcan-compass-api.onrender.com"
  NEXT_PUBLIC_APP_URL = "https://compass.olcan.com.br"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Key changes:
- Build command explicitly uses `--shamefully-hoist` flag
- Uses `pnpm build:v2` (defined in root package.json)
- Added `@netlify/plugin-nextjs` for proper Next.js handling
- Correct publish directory: `apps/web-v2/.next`

### 4. Simplified `apps/web-v2/next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
};

export default nextConfig;
```

Removed `output: 'standalone'` as Netlify plugin handles this.

## Verification Steps

After deploying, verify:

1. **Build succeeds** - Check Netlify build logs
2. **No styled-jsx errors** - Should see successful Next.js build
3. **All pages load** - Test navigation across the app
4. **Glassmorphism renders** - Verify backdrop-blur effects work

## Testing Locally

Before pushing, test the build:

```bash
# Clean install with new .npmrc settings
rm -rf node_modules apps/web-v2/node_modules
pnpm install --shamefully-hoist

# Build web-v2
pnpm build:v2

# Verify no errors
cd apps/web-v2
pnpm start
```

## Why This Works

1. **Hoisting**: `shamefully-hoist=true` flattens the dependency tree
2. **Public patterns**: Explicitly hoists `styled-jsx` and `next` to root
3. **Netlify plugin**: `@netlify/plugin-nextjs` properly bundles Next.js for serverless
4. **Build flag**: `--shamefully-hoist` in build command ensures Netlify uses same strategy

## Alternative Solutions (Not Used)

We didn't use these because they're more complex:

1. **Standalone output** - Requires custom server setup
2. **Manual bundling** - Would need to manually include styled-jsx
3. **Vercel deployment** - Would work out of the box but requires platform change

## Related Files

- `.npmrc` - Root pnpm config
- `apps/web-v2/.npmrc` - Web-v2 specific config
- `netlify.toml` - Netlify build configuration
- `apps/web-v2/next.config.mjs` - Next.js config
- `apps/web-v2/package.json` - Already has `styled-jsx: 5.1.1`

## Next Steps

1. Commit these changes
2. Push to trigger Netlify build
3. Monitor build logs for success
4. Test production deployment
5. If issues persist, check Netlify function logs

## Rollback Plan

If this doesn't work, revert to:
```bash
git revert HEAD
```

Then try alternative: Deploy to Vercel instead (Next.js native platform).
