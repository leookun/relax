import Koa from "koa";
import nodemailer from "nodemailer";
import jwt from "koa-jwt";
import { fileURLToPath } from 'url';
import path ,{resolve}from 'path';
import fs from 'node:fs';
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import { Logger, LoggerLevel } from "./common/logger";
import { Config } from "./common/config";
import { CronJob, CronCommand } from "cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODE_EMAIL_TEMPLATE=
fs.readFileSync(resolve(__dirname,"./common/verification-code.template"),"utf-8")

export * from "./common/config";
export * from "./common/logger";
export type SendCodeEmail=(to:string,body:{code:string,userName:string})=>Promise<true>
export default class Application extends Koa {
  public config: Config = {
    port: process.env.PORT || 3000,
    debugLogging: false,
    jwtSecret: process.env.JWT_SECRET || "",
    databaseUrl: process.env.DATABASE_URL || "",
    cronJobExpression: "0 * * * *",
    email:{
      user:"",
      pass:"",
    }
  };
  public logger: InstanceType<typeof Logger>;
  public services: any;
  public emailClient: any;
  public sendCodeEmail: SendCodeEmail;
  public controller: boolean;
  constructor(options: Config) {
    super();
    this.config = options;
    this.logger = new Logger();
    this.applyMiddleware();
    this.applyEmail();
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
  public applyEmail(){
    const emailClient = nodemailer.createTransport({
      host: this.config.email?.host||'',
      service: this.config.email.service||'',
      auth: this.config.email
    });
    this.emailClient=emailClient
    
    const sendCodeEmail:SendCodeEmail=async (to,body)=>{
      return new Promise((resolve,reject)=>{
        emailClient.sendMail({
          from: `邮箱验证消息 <${this.config.email.user}>`,
          to,
          subject: "你正在邮箱验证",
          html: CODE_EMAIL_TEMPLATE.replace("{{USER_NAME}}",body.userName)
            .replace("{{CODE}}",body.code)
        }, function(error, info) {
          if (error) {
            reject(error)
          } else {
            this.logger.info(`Email Sended To ${to} :[${body.userName},${body.code}]`)
            resolve(true)
          }
        });
      })
    }
    this.sendCodeEmail=sendCodeEmail
    this.use(async(ctx,next)=>{
      ctx.emailClient=emailClient;
      ctx.sendCodeEmail=sendCodeEmail;
      await next()
    });
  }
  public applyMiddleware() {
    this.use(helmet());
    this.use(this.loggerMiddleware);
    this.use(bodyParser());
    this.use(async (ctx,next)=>{
      ctx.logger=this.logger
      await next()
    })
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
