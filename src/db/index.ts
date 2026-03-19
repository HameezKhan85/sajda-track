import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('ep-xxx')) {
  console.warn('⚠️  DATABASE_URL not configured. Please set it in .env.local');
}

const sql = neon(databaseUrl || 'postgresql://placeholder:placeholder@localhost/placeholder');
export const db = drizzle(sql, { schema });
