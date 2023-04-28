export interface Config {
  port: number | string;
  debugLogging: boolean;
  jwtSecret: string;
  databaseUrl: string;
  cronJobExpression: string;
}