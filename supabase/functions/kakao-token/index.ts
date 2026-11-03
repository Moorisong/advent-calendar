// Exchange a Kakao authorization code on the server; never expose the client secret.
const TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

function response(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    },
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') ?? '';
  const allowed = (Deno.env.get('KAKAO_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!allowed.includes(origin)) {
    return response({ error: 'ORIGIN_NOT_ALLOWED' }, 403, 'null');
  }
  if (request.method === 'OPTIONS') {
    return response({}, 200, origin);
  }
  if (request.method !== 'POST') {
    return response({ error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  }
  const clientId = Deno.env.get('KAKAO_REST_API_KEY');
  const secret = Deno.env.get('KAKAO_CLIENT_SECRET');
  if (!clientId || !secret) {
    return response({ error: 'KAKAO_SERVER_NOT_CONFIGURED' }, 503, origin);
  }
  let code: unknown;
  let redirectUri: unknown;
  try {
    ({ code, redirectUri } = await request.json());
  } catch {
    return response({ error: 'INVALID_REQUEST' }, 400, origin);
  }
  if (
    typeof code !== 'string' ||
    code.length < 5 ||
    code.length > 2048 ||
    redirectUri !== new URL('/auth/callback', origin).href
  ) {
    return response({ error: 'INVALID_REQUEST' }, 400, origin);
  }
  try {
    const upstream = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: secret,
        redirect_uri: redirectUri,
        code,
      }),
    });
    if (!upstream.ok) {
      return response({ error: 'KAKAO_TOKEN_EXCHANGE_FAILED' }, 401, origin);
    }
    const tokens = await upstream.json();
    if (typeof tokens.id_token !== 'string') {
      return response({ error: 'KAKAO_ID_TOKEN_MISSING' }, 502, origin);
    }
    return response({ id_token: tokens.id_token }, 200, origin);
  } catch {
    return response({ error: 'KAKAO_UNAVAILABLE' }, 502, origin);
  }
});
