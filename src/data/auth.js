import { finishKakaoSignIn, startKakaoSignIn } from './kakao.js';
import { db, requireDatabase } from './client.js';

const PROVIDERS = Object.freeze(new Set(['kakao', 'google']));

export async function getUser() {
  if (!db) {
    return null;
  }
  const { data, error } = await db.auth.getUser();
  if (error) {
    return null;
  }
  return data?.user ?? null;
}

export async function signIn(provider) {
  if (!PROVIDERS.has(provider)) {
    throw new Error('INVALID_PROVIDER');
  }
  if (provider === 'kakao') {
    startKakaoSignIn();
    return;
  }
  const client = requireDatabase();
  const redirectTo = new URL('/auth/callback', window.location.origin).href;
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) {
    throw error;
  }
}

export async function finishSignIn(code, url = new URL(window.location.href)) {
  if (url.searchParams.has('state')) {
    return finishKakaoSignIn(url);
  }
  if (!code || typeof code !== 'string') {
    throw new Error('MISSING_AUTH_CODE');
  }
  const client = requireDatabase();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    throw error;
  }
  return getUser();
}

export async function logout() {
  const client = requireDatabase();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export function subscribeToAuth(callback) {
  if (!db) {
    return () => {};
  }
  const { data } = db.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
