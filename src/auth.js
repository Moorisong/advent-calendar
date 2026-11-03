import { createClient } from '@supabase/supabase-js';

// Only public frontend credentials belong here. Never expose a service_role/secret key.
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const authConfigured = Boolean(url && publishableKey);
const client = authConfigured
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

export async function getAuthenticatedUser() {
  if (!client) return null;
  // Verify with Auth server; local session storage alone is not authorization.
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
}

export async function signInWithProvider(provider) {
  if (!client) throw new Error('AUTH_NOT_CONFIGURED');
  if (provider !== 'google' && provider !== 'kakao') throw new Error('INVALID_PROVIDER');
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export function listenForAuth(callback) {
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}
