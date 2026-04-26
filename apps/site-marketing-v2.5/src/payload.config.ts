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

const allowedOrigins = (
  process.env.PAYLOAD_CORS_ORIGINS ||
  [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://olcan.com.br",
    "https://www.olcan.com.br",
    "https://compass.olcan.com.br",
    "https://app.olcan.com.br",
    "https://marketplace.olcan.com.br",
    "https://admin.olcan.com.br",
    "https://vendors.olcan.com.br",
    "https://staff.olcan.com.br",
    "https://zenith.olcan.com.br",
  ].join(",")
).split(",").map((s) => s.trim()).filter(Boolean);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Olcan OS',
    },
    theme: 'dark',
  },
  cors: allowedOrigins,
  csrf: allowedOrigins,
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
