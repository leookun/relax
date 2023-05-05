import dotenv from "dotenv";
dotenv.config({ path: ".env" });
export interface Config {
  port: number | string;
  debugLogging: boolean;
  jwtSecret: string;
  databaseUrl: string;
  cronJobExpression: string;
}
const isDevMode = process.env.NODE_ENV == "development";
const config: Config = {
  port: process.env.PORT || 3000,
  debugLogging: isDevMode,
  jwtSecret: process.env.JWT_SECRET || "",
  databaseUrl:
    process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/apidb",
  cronJobExpression: "* * * * *",
};

export default config;
