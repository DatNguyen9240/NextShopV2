import axiosClient from '../lib/axiosClient';

export async function getPasskeys() {
  const res = await axiosClient.get('/api/webauthn/passkeys');
  return res.data;
}

export async function startRegister() {
  const res = await axiosClient.post('/api/webauthn/register/options');
  return res.data;
}

export async function verifyRegister(payload: any) {
  // Ensure payload is JSON-serializable. Some credential objects may contain non-serializable values.
  let body = payload;

  // Convert ArrayBuffer/TypedArray to base64url
  const toBase64Url = (input: any) => {
    try {
      let bytes: Uint8Array | null = null;
      if (input instanceof ArrayBuffer) bytes = new Uint8Array(input);
      else if (ArrayBuffer.isView(input)) bytes = new Uint8Array((input as any).buffer);
      else return input;

      let str = '';
      for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
      return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      return input;
    }
  };

  // Deep-sanitize objects: convert ArrayBuffer/TypedArray to base64url, remove functions, symbols
  const deepSanitize = (obj: any): any => {
    if (obj == null) return obj;
    if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) return toBase64Url(obj);
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepSanitize);
    const res: any = {};
    for (const k of Object.keys(obj)) {
      const v = (obj as any)[k];
      if (typeof v === 'function' || typeof v === 'symbol') continue;
      try {
        res[k] = deepSanitize(v);
      } catch (e) {
        res[k] = String(v);
      }
    }
    return res;
  };

  if (body && body.challenge && (body.challenge instanceof ArrayBuffer || ArrayBuffer.isView(body.challenge))) {
    body = { ...body, challenge: toBase64Url(body.challenge) };
  }

  try {
    JSON.stringify(body);
  } catch (err) {
    console.warn('[webauthnService] payload not serializable, sanitizing', err);
    const sanitized: any = { ...body };
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