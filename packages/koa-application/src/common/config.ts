export interface Config {
  port: number | string;
  jwtSecret: string;
  databaseUrl: string;
  cronJobExpression: string;
  redis: string;
  email: {
    host?:string,
    service?:string,
    user:string,
    pass:string,
  };
}
