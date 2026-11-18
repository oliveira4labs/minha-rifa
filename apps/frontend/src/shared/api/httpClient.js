const DEFAULT_ERROR = 'Não foi possível concluir. Tente novamente.';

export class ApiError extends Error {
  constructor(message, { status, busy } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.busy = busy;
  }
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) throw new ApiError(data.error || DEFAULT_ERROR, { status: res.status, busy: data.busy });
  return data;
}

export const http = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
};
