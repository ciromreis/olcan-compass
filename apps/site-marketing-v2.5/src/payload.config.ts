import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Chronicles } from '@/collections/Chronicles'
import { Pages } from '@/collections/Pages'
import { Archetypes } from '@/collections/Archetypes'
import { Users } from '@/collections/Users'
import { CommunityItems } from '@/collections/CommunityItems'
import { Replies } from '@/collections/Replies'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Olcan OS',
    },
    // Theming overrides according to the task specs
    // Clinical Boutique / Liquid-Glass aesthetic injected via CSS later
    theme: 'dark',
  },
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://olcan.com.br',
    'https://www.olcan.com.br',
    'https://app.olcan.com.br',
    'https://compass.olcan.com.br',
    'https://site.olcan.com.br',
    'https://nexus.olcan.com.br',
    'https://zenith.olcan.com.br'
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://olcan.com.br',
    'https://www.olcan.com.br',
    'https://app.olcan.com.br',
    'https://compass.olcan.com.br',
    'https://site.olcan.com.br',
    'https://nexus.olcan.com.br',
    'https://zenith.olcan.com.br'
  ],
  collections: [Users, Chronicles, Pages, Archetypes, CommunityItems, Replies],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-development-olcan',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Using the same database connection as requested
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
})
