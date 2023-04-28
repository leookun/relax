import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import type { Config } from "@leokun/koa-application";
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
