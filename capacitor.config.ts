import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.balam.crm',
  appName: 'Balam CRM',
  webDir: 'out',
  server: {
    // Use a real hostname so the WebView origin matches what the backend CORS allows.
    // Requests will appear to come from https://app.balam.crm rather than https://localhost.
    hostname: 'app.balam.crm',
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
};

export default config;
