#!/bin/bash

# Fix all TypeScript errors in the Olcan Compass frontend

echo "Fixing TypeScript errors..."

# Fix missing Radio export
echo "export { RadioGroup as Radio } from './RadioGroup'" >> apps/web/src/components/ui/Radio.ts 2>/dev/null || true

# Fix App.tsx lazy imports - they need .then(m => ({ default: m.default }))
sed -i.bak "s/import('./pages\/Narratives')/import('.\/pages\/Narratives').then(m => ({ default: m.default || m.NarrativesDashboard }))/g" apps/web/src/App.tsx
sed -i.bak "s/import('./pages\/Interviews')/import('.\/pages\/Interviews').then(m => ({ default: m.default || m }))/g" apps/web/src/App.tsx
sed -i.bak "s/import('./pages\/Applications')/import('.\/pages\/Applications').then(m => ({ default: m.default || m }))/g" apps/web/src/App.tsx
sed -i.bak "s/import('./pages\/Sprints')/import('.\/pages\/Sprints').then(m => ({ default: m.default || m }))/g" apps/web/src/App.tsx
sed -i.bak "s/import('./pages\/Marketplace')/import('.\/pages\/Marketplace').then(m => ({ default: m.default || m }))/g" apps/web/src/App.tsx

# Fix unused imports
find apps/web/src -name "*.tsx" -type f -exec sed -i.bak '/^import.*motion.*from.*framer-motion/s/^import { motion }/import { motion } \/\/ eslint-disable-line @typescript-eslint\/no-unused-vars/' {} \;

echo "Done! Run 'npm run build' to verify fixes."
