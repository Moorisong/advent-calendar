import { requireDatabase } from './client.js';

const STORAGE_KEY = 'dear-choco:kakao-oauth';
const AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
const EXPIRES_MS = 10 * 60 * 1000;

function randomValue() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function callbackUrl() {
  return new URL('/auth/callback', window.location.origin).href;
}

async function hashNonce(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function startKakaoSignIn() {
  const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY?.trim();
  if (!clientId) {
    throw new Error('KAKAO_CLIENT_ID_NOT_CONFIGURED');
  }
  requireDatabase();
  const state = randomValue();
  const nonce = randomValue();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    state,
    nonce,
    createdAt: Date.now(),
  }));
  const url = new URL(AUTH_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid,profile_nickname,profile_image');
  url.searchParams.set('state', state);
  url.searchParams.set('nonce', await hashNonce(nonce));
  window.location.assign(url.href);
}

export async function finishKakaoSignIn(url) {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!saved) {
    throw new Error('KAKAO_AUTH_STATE_MISSING');
  }
  let pending;
  try {
    pending = JSON.parse(saved);
  } catch {
    throw new Error('KAKAO_AUTH_STATE_INVALID');
  }
  if (
    !pending.state ||
    !pending.nonce ||
    Date.now() - pending.createdAt > EXPIRES_MS ||
    Date.now() < pending.createdAt ||
    url.searchParams.get('state') !== pending.state
  ) {
    throw new Error('KAKAO_AUTH_STATE_INVALID');
  }
  const code = url.searchParams.get('code');
  if (!code) {
    throw new Error('MISSING_AUTH_CODE');
  }
  const client = requireDatabase();
  const { data, error } = await client.functions.invoke('kakao-token', {
    body: { code, redirectUri: callbackUrl() },
  });
  if (error || !data?.id_token) {
    throw error ?? new Error('KAKAO_TOKEN_EXCHANGE_FAILED');
  }
  const result = await client.auth.signInWithIdToken({
    provider: 'kakao',
    token: data.id_token,
    nonce: pending.nonce,
  });
  if (result.error) {
    throw result.error;
  }
  return result.data.user;
}
