import axiosClient from '../lib/axiosClient';

export async function getPasskeys() {
  const res = await axiosClient.get('/api/webauthn/passkeys');
  return res.data;
}

export async function startRegister() {
  const res = await axiosClient.post('/api/webauthn/register/options');
  return res.data;
}

export async function verifyRegister(payload: unknown) {
  // Ensure payload is JSON-serializable. Some credential objects may contain non-serializable values.
  let body: unknown = payload;

  // Convert ArrayBuffer/TypedArray to base64url
  const toBase64Url = (input: ArrayBuffer | ArrayBufferView): string => {
    try {
      const bytes = new Uint8Array(input instanceof ArrayBuffer ? input : (input as ArrayBufferView).buffer);
      let str = '';
      for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch {
      return '';
    }
  };

  // Deep-sanitize objects: convert ArrayBuffer/TypedArray to base64url, remove functions, symbols
  const deepSanitize = (obj: unknown): unknown => {
    if (obj == null) return obj;
    if (obj instanceof ArrayBuffer) return toBase64Url(obj);
    if (ArrayBuffer.isView(obj)) return toBase64Url(obj as ArrayBufferView);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return (obj as unknown[]).map(deepSanitize);
    const res: Record<string, unknown> = {};
    for (const k of Object.keys(obj as object)) {
      const v = (obj as Record<string, unknown>)[k];
      if (typeof v === 'function' || typeof v === 'symbol') continue;
      try {
        res[k] = deepSanitize(v);
      } catch {
        res[k] = String(v);
      }
    }
    return res;
  };

  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    const ch = b.challenge;
    if (ch && (ch instanceof ArrayBuffer || ArrayBuffer.isView(ch))) {
      body = { ...b, challenge: toBase64Url(ch as ArrayBuffer | ArrayBufferView) };
    }
  }

  try {
    JSON.stringify(body);
  } catch (err) {
    console.warn('[webauthnService] payload not serializable, sanitizing', err);
    const sanitized: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    if (sanitized.credential) {
      try {
        sanitized.credential = deepSanitize(sanitized.credential);
      } catch {
        sanitized.credential = String(sanitized.credential);
      }
    }
    body = sanitized;
  }

  const res = await axiosClient.post('/api/webauthn/register/verify', body);
  return res.data;
}

export async function revokePasskey(id: string) {
  const res = await axiosClient.delete('/api/webauthn/passkeys/' + encodeURIComponent(id));
  return res.data;
}