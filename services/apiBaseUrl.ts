import Constants from 'expo-constants';

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

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return stripTrailingSlash(envUrl.trim());
  }

  const hostUri = inferHostUri();
  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:3000`;
  }

  // NOTE: On a physical device, localhost points to the phone.
  // This fallback is mostly useful for Android emulator / iOS simulator.
  return 'http://localhost:3000';
}
