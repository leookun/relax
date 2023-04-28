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
  public services: any;
  public controller: boolean;
  constructor(options: Config) {
    super();
    this.config = options;
    this.logger = new Logger();
    this.applyMiddleware();
  }
  static onStartApp(port:string|number) {
    new Logger().info(`App Started On Port ${port}`);
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
      const ms = new Date().getTime() - start;
      let logLevel: LoggerLevel="error";
      if (ctx.status >= 500) {
        logLevel = "error";
      } else if (ctx.status >= 400) {
        logLevel = "warn";
      } else {
        logLevel = "info";
      }
      const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
      ctx.body = msg;
      new Logger().log(logLevel, `${msg} :${error.message}`);
    }
  }
  public applyMiddleware() {
    this.use(helmet());
    this.use(this.loggerMiddleware);
    this.use(bodyParser());
    return this;
  }
  public applyController(enforceController: (app: Application) => Application) {
    this.controller=true
    enforceController(this)
    return this;
  }
  public applyServices(services: any) {
    this.services=services
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
  public start(callback: (port?:number|string) => void) {
    if(!this.controller){
      this.logger.error("Controller Not For Ready. Call `applyController` First")
      return 
    }
    if(!this.services){
      this.logger.error("Services Not For Ready. Call `applyServices` First")
      return 
    }
    const { port } = this.config;
    this.listen(port, ()=>callback(port));
    return this;
  }
}
