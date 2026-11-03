import { createClient } from '@supabase/supabase-js';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const publicKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isConfigured = Boolean(projectUrl && publicKey);
export const db = isConfigured
  ? createClient(projectUrl, publicKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
      },
    })
  : null;

export function requireDatabase() {
  if (db === null) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  return db;
}
