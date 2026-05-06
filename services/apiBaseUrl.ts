import Constants from 'expo-constants';
import { Platform } from 'react-native';

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function inferHostUri(): string | undefined {
  const anyConstants: any = Constants as any;
  return (
    anyConstants?.expoConfig?.hostUri ||
    anyConstants?.manifest?.hostUri ||
    anyConstants?.manifest2?.extra?.expoClient?.hostUri
  );
}

function hostFromHostUri(hostUri: string): string | undefined {
  // hostUri examples seen in Expo:
  // - "192.168.1.10:8081"
  // - "localhost:19000"
  // - "http://192.168.1.10:8081"
  // - "https://<something>/" (tunnel)
  const withoutScheme = hostUri.replace(/^https?:\/\//i, '');
  const firstSegment = withoutScheme.split('/')[0];
  const host = firstSegment.split(':')[0];
  return host || undefined;
}

function baseUrlFromHostUri(hostUri: string): string | undefined {
  const host = hostFromHostUri(hostUri);
  if (!host) return undefined;

  // On Android, "localhost" points to the emulator/device itself.
  // Use the Android emulator's host loopback address when we see localhost.
  if ((host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return `http://${host}:3000`;
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return stripTrailingSlash(envUrl.trim());
  }

  const hostUri = inferHostUri();
  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const inferred = baseUrlFromHostUri(hostUri);
    if (inferred) return inferred;
  }

  // Last-resort defaults.
  // - Android emulator can reach your PC at 10.0.2.2
  // - iOS simulator / web typically reach your machine at localhost
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

// ── Fetch with timeout ────────────────────────────────────────────────────────
// Wraps the global fetch with an AbortController so requests never hang forever.
const TIMEOUT_MS = 12_000; // 12 seconds

export async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_MS / 1000}s. Is the backend server running?`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
