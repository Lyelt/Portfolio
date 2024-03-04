import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.ghobrial.gamenight',
  appName: 'Game Night',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
    // allowNavigation: [
    //   "https://ghobrial.dev/*"
    // ]
  }
};

export default config;
