const BASE = (() => {
  const p = location.pathname;
  if (p.includes('/digest')) return p.split('/digest')[0] + '/digest/api';
  return '/api';
})();

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'same-origin',
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function fetchDigests({ type, limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return request(`/digests?${params}`);
}

export async function fetchDigest(id) {
  return request(`/digests/${id}`);
}

export async function fetchSources() {
  return request('/sources');
}

export async function fetchMarks() {
  return request('/marks');
}

export async function createMark(url) {
  return request('/marks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export async function fetchAuthConfig() {
  return request('/auth/config');
}

export async function fetchAuthMe() {
  return request('/auth/me');
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export async function fetchRawItemStats() {
  return request('/raw-items/stats');
}
