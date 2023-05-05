import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import type { Config } from "@leokun/koa-application";
const config: Config = {
  redis:process.env.REDIS_URL,
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "",
  databaseUrl: process.env.DATABASE_URL,
  cronJobExpression: "* * * * *",
  email:{
    service:process.env.EMAIL_SERVICES,
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASSWORD,
  }
};

export default config;
