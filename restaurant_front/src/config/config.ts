import { environment } from './environment';

interface Config {
  API_URL: string;
  ENVIRONMENT: 'development' | 'production';
  DEBUG: boolean;
  LOG_LEVEL: 'debug' | 'error';
}

const getConfig = (): Config => {
  const envMode = (import.meta as any).env?.MODE || 'development';
  const envKey = (envMode as keyof typeof environment) || 'development';
  const envConfig = environment[envKey] || environment.development;

  const apiUrlFromEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;

  return {
    ...envConfig,
    API_URL: apiUrlFromEnv ?? envConfig.API_URL,
    ENVIRONMENT: envConfig.ENVIRONMENT,
  };
};

export const config = getConfig();
export default config;
