export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const base64Padded = base64 + (pad ? '='.repeat(4 - pad) : '');
  const binary = atob(base64Padded);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

export function preformatMakeCredReq(makeCredReq: Record<string, unknown>): Record<string, unknown> {
  if (!makeCredReq || !makeCredReq.challenge || !makeCredReq.user || !((makeCredReq.user as Record<string, unknown>).id)) {
    throw new Error('Invalid registration options received from server');
  }

  // convert challenge and user.id to ArrayBuffer
  (makeCredReq as Record<string, unknown>).challenge = base64UrlToBuffer(String(makeCredReq.challenge));
  (makeCredReq.user as Record<string, unknown>).id = base64UrlToBuffer(String((makeCredReq.user as Record<string, unknown>).id));

  if (Array.isArray((makeCredReq as Record<string, unknown>).excludeCredentials)) {
    (makeCredReq as Record<string, unknown>).excludeCredentials = ((makeCredReq as Record<string, unknown>).excludeCredentials as Array<Record<string, unknown>>).map((c) => ({
      ...c,
      id: base64UrlToBuffer(String(c.id))
    }));
  }
  return makeCredReq;
}

export function preformatGetAssertReq(getAssertReq: Record<string, unknown>): Record<string, unknown> {
  if (!getAssertReq || !getAssertReq.challenge) {
    throw new Error('Invalid assertion options received from server: missing challenge. Response: ' + JSON.stringify(getAssertReq));
  }

  // Ensure challenge is a string before converting
  const challengeStr = typeof getAssertReq.challenge === 'string' ? getAssertReq.challenge : String(getAssertReq.challenge);
  getAssertReq.challenge = base64UrlToBuffer(challengeStr);

  if (getAssertReq.allowCredentials && Array.isArray(getAssertReq.allowCredentials)) {
    getAssertReq.allowCredentials = (getAssertReq.allowCredentials as Array<Record<string, unknown>>).map((c) => ({
      ...c,
      id: c && c.id ? base64UrlToBuffer(String(c.id)) : c.id
    }));
  } else {
    // ensure allowCredentials is at least an empty array to avoid undefined checks later
    getAssertReq.allowCredentials = [];
  }

  return getAssertReq;
}

export function publicKeyCredentialToJSON(pubKeyCred: unknown): unknown {
  if (pubKeyCred instanceof Array) return (pubKeyCred as unknown[]).map(publicKeyCredentialToJSON);
  if (pubKeyCred instanceof ArrayBuffer) return bufferToBase64Url(pubKeyCred as ArrayBuffer);
  if (pubKeyCred && typeof pubKeyCred === 'object') {
    const obj: Record<string, unknown> = {};
    for (const key in pubKeyCred as object) {
      obj[key] = publicKeyCredentialToJSON((pubKeyCred as Record<string, unknown>)[key]);
    }
    return obj;
  }
  return pubKeyCred;
}