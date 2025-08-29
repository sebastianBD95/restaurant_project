export const environment = {
  development: {
    API_URL: 'http://localhost:8080',
    ENVIRONMENT: 'development' as const,
    DEBUG: true,
    LOG_LEVEL: 'debug' as const
  },
  production: {
    API_URL: 'https://api.servu.com.co',
    ENVIRONMENT: 'production' as const,
    DEBUG: false,
    LOG_LEVEL: 'error' as const
  }
};

export type Environment = keyof typeof environment;
export type EnvironmentConfig = typeof environment[Environment];
