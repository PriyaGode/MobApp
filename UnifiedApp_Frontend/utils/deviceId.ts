// Lightweight device fingerprint (no native modules required)
// In production you could enhance with platform/device info.

let cachedId: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedId) return cachedId;
  // Use a deterministic seed per session; could persist via AsyncStorage if needed.
  cachedId = 'devfp_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
  return cachedId;
}
