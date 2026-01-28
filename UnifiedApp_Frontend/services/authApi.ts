import { API_BASE } from './apiBase';

export type BackendLoginResult = {
  authenticated: boolean;
  userId?: number | string;
  email?: string;
  fullName?: string;
  error?: string;
};

export async function loginWithBackend(email: string, password: string): Promise<BackendLoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  } catch (networkErr: any) {
    throw new Error(`Network error contacting auth service: ${networkErr?.message || 'unknown'}`);
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // If body is not JSON, capture text for diagnostics
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`Auth failed (${res.status}): ${text || 'non-JSON error response'}`);
    }
    return { authenticated: false, error: 'Unexpected response format' };
  }

  if (!res.ok) {
    const message = json?.error || `Auth failed with status ${res.status}`;
    throw new Error(message);
  }

  return json as BackendLoginResult;
}
