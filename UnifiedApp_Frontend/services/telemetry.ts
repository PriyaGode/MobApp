// Simple telemetry stub to satisfy imports without backend wiring
export type TelemetryEvent = string;
export interface TelemetryPayload { [key: string]: any }

export function trackTelemetry(event: TelemetryEvent, payload?: TelemetryPayload) {
  if (__DEV__) {
    console.log(`[telemetry] ${event}`, payload || {});
  }
}
