import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.balam.crm',
  appName: 'Balam CRM',
  webDir: 'out',
  server: {
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
