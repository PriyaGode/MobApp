const blockedPhones = new Set<string>();
const blockedDeviceIds = new Set<string>();
const deviceRequestLog = new Map<string, number[]>();
const phoneRequestLog = new Map<string, number[]>();

const REQUEST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_PHONE_REQUESTS_PER_WINDOW = 6;

export class SecurityViolation extends Error {
  constructor(public readonly code: "PHONE_BLOCKED" | "DEVICE_BLOCKED" | "RATE_LIMITED") {
    super(code);
  }
}

export function isPhoneBlocked(phoneE164: string): boolean {
  return blockedPhones.has(phoneE164);
}

export function isDeviceBlocked(deviceId: string): boolean {
  return blockedDeviceIds.has(deviceId);
}

export function ensureOtpRequestAllowed(phoneE164: string, deviceId: string): void {
  if (isPhoneBlocked(phoneE164)) {
    throw new SecurityViolation("PHONE_BLOCKED");
  }

  if (isDeviceBlocked(deviceId)) {
    throw new SecurityViolation("DEVICE_BLOCKED");
  }

  const now = Date.now();
  const windowStart = now - REQUEST_WINDOW_MS;
  const deviceHistory = deviceRequestLog.get(deviceId) ?? [];
  const recentDeviceRequests = deviceHistory.filter(timestamp => timestamp >= windowStart);

  if (recentDeviceRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new SecurityViolation("RATE_LIMITED");
  }

  deviceRequestLog.set(deviceId, [...recentDeviceRequests, now]);

  const phoneHistory = phoneRequestLog.get(phoneE164) ?? [];
  const recentPhoneRequests = phoneHistory.filter(timestamp => timestamp >= windowStart);

  if (recentPhoneRequests.length >= MAX_PHONE_REQUESTS_PER_WINDOW) {
    throw new SecurityViolation("RATE_LIMITED");
  }

  phoneRequestLog.set(phoneE164, [...recentPhoneRequests, now]);
}

export function recordSuccessfulVerification(deviceId: string): void {
  deviceRequestLog.set(deviceId, []);
}

export function blockPhone(phoneE164: string): void {
  blockedPhones.add(phoneE164);
}

export function blockDevice(deviceId: string): void {
  blockedDeviceIds.add(deviceId);
}

export function unblockPhone(phoneE164: string): void {
  blockedPhones.delete(phoneE164);
}

export function unblockDevice(deviceId: string): void {
  blockedDeviceIds.delete(deviceId);
}
