import 'dotenv/config';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local (drizzle-kit doesn't read it by default)
config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
