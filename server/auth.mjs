const encoder = new TextEncoder();
const PROOF_MESSAGE = encoder.encode('ROOM password verifier v1');
export const SESSION_SECONDS = 8 * 60 * 60;
export const COOKIE_NAME = '__Host-room_session';

export function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), x => x.charCodeAt(0));
}

async function passwordKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    material, { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign', 'verify'],
  );
}

// Only the salted verifier is stored in the hosting platform's secret store.
export async function createPasswordVerifier(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await passwordKey(password, salt);
  const proof = await crypto.subtle.sign('HMAC', key, PROOF_MESSAGE);
  return `v1.${toBase64Url(salt)}.${toBase64Url(proof)}`;
}

export function configured(env) {
  return /^v1\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/.test(env.ROOM_PASSWORD_VERIFIER ?? '')
    && /^[A-Za-z0-9_-]{43}$/.test(env.ROOM_SESSION_SECRET ?? '');
}

export async function verifyPassword(password, verifier) {
  if (typeof password !== 'string' || password.length > 256) return false;
  try {
    const [version, salt, proof, extra] = verifier.split('.');
    if (version !== 'v1' || extra) return false;
    const key = await passwordKey(password, fromBase64Url(salt));
    return crypto.subtle.verify('HMAC', key, fromBase64Url(proof), PROOF_MESSAGE);
  } catch { return false; }
}

async function sessionKey(env) {
  return crypto.subtle.importKey('raw', fromBase64Url(env.ROOM_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function sessionMessage(payload, env) {
  // Password rotation automatically invalidates cookies issued with an older verifier.
  return encoder.encode(`ROOM session v1\n${env.ROOM_PASSWORD_VERIFIER}\n${payload}`);
}

export async function issueSession(env, origin, now = Math.floor(Date.now() / 1000)) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    v: 1, iat: now, exp: now + SESSION_SECONDS, aud: origin,
    nonce: toBase64Url(crypto.getRandomValues(new Uint8Array(16))),
  })));
  const signature = await crypto.subtle.sign('HMAC', await sessionKey(env), sessionMessage(payload, env));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function validSession(request, env, now = Math.floor(Date.now() / 1000)) {
  const matches = (request.headers.get('Cookie') ?? '').split(';').map(x => x.trim())
    .filter(x => x.startsWith(`${COOKIE_NAME}=`));
  if (matches.length !== 1) return false;
  const token = matches[0].slice(COOKIE_NAME.length + 1);
  if (token.length > 1024) return false;
  try {
    const [payload, signature, extra] = token.split('.');
    if (extra || !payload || !signature) return false;
    if (!await crypto.subtle.verify('HMAC', await sessionKey(env), fromBase64Url(signature), sessionMessage(payload, env))) return false;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return data.v === 1 && data.aud === new URL(request.url).origin
      && Number.isSafeInteger(data.iat) && Number.isSafeInteger(data.exp)
      && data.iat <= now + 60 && data.exp > now
      && data.exp - data.iat === SESSION_SECONDS;
  } catch { return false; }
}

export function sessionCookie(value, maxAge = SESSION_SECONDS) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
