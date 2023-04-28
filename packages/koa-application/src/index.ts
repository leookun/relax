import Koa from "koa";
import jwt from "koa-jwt";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import { Logger, LoggerLevel } from "./common/logger";
import { Config } from "./common/config";
import { CronJob, CronCommand } from "cron";
import Router from "koa-router";
export * from "./common/config";
export * from "./common/logger";

export default class Application extends Koa {
  public config: Config = {
    port: process.env.PORT || 3000,
    debugLogging: false,
    jwtSecret: process.env.JWT_SECRET || "",
    databaseUrl: process.env.DATABASE_URL || "",
    cronJobExpression: "0 * * * *",
  };
  public logger: InstanceType<typeof Logger>;
  constructor(options: Config) {
    super();
    this.config = options;
    this.logger = new Logger();
    this.applyMiddleware();
  }
  static onStartApp() {
    new Logger().info("App Started! ");
  }
  static onStartTasksJob() {
    new Logger().info("TasksJobs Started!");
  }
  public async loggerMiddleware(ctx: Koa.Context, next: Koa.Next) {
    const start = new Date().getTime();
    try {
      await next();
    } catch (error) {
      ctx.status = error.status || 500;
      ctx.body = error.message;
      const ms = new Date().getTime() - start;
      let logLevel: LoggerLevel;
      if (ctx.status >= 500) {
        logLevel = "error";
      } else if (ctx.status >= 400) {
        logLevel = "warn";
      } else {
        logLevel = "info";
      }
      const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
      this.logger.log(logLevel, msg);
    }
  }
  public applyMiddleware() {
    this.use(helmet());
    this.use(this.loggerMiddleware);
    this.use(bodyParser());
    this.use(async (ctx, next) => {
      ctx.Application = this;
      await next();
    });
    return this;
  }
  public applyController(controller: Router) {
    this.use(controller.routes());
    return this;
  }
  public startTasksJob(callback = (() => {}) as CronCommand) {
    new CronJob({
      onTick: callback,
      cronTime: this.config.cronJobExpression,
      runOnInit: true,
    });
    return this;
  }
  public start(callback: () => void) {
    const { port } = this.config;
    this.listen(port, callback);
    return this;
  }
}
