import { environment } from './environment';

interface Config {
  API_URL: string;
  ENVIRONMENT: 'development' | 'production';
  DEBUG: boolean;
  LOG_LEVEL: 'debug' | 'error';
}

const getConfig = (): Config => {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = environment[env as keyof typeof environment] || environment.development;
  
  return {
    ...envConfig,
    API_URL: envConfig.API_URL,
    ENVIRONMENT: envConfig.ENVIRONMENT
  };
};

export const config = getConfig();
export default config;
