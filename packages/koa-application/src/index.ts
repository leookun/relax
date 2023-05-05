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
import * as R from "ramda"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODE_EMAIL_TEMPLATE=
fs.readFileSync(resolve(__dirname,"./common/verification-code.template"),"utf-8")

export * from "./common/config";
export * from "./common/logger";
export type SendCodeEmail=(to:string,body:{code:string,userName:string})=>Promise<true>
export type RequireCheck=(params:Record<string,unknown>)=>void
export type Reply=<T,>(params:T)=>void



const createApp=(config:Config)=>{
  const logger=new Logger();
  let hasController=false;
  const emailClient = nodemailer.createTransport({
    host: config.email?.host||'',
    service: config.email.service||'',
    auth: config.email
  });

  const sendCodeEmail:SendCodeEmail=async (to,body)=>{
    return new Promise((resolve,reject)=>{
      emailClient.sendMail({
        from: `邮箱验证消息 <${config.email.user}>`,
        to,
        subject: "你正在邮箱验证",
        html: CODE_EMAIL_TEMPLATE.replace("{{USER_NAME}}",body.userName)
          .replace("{{CODE}}",body.code)
      }, function(error, info) {
        if (error) {
          reject(error)
        } else {
          logger.info(`Email Sended To ${to} :[${body.userName},${body.code}]`)
          resolve(true)
        }
      });
    })
  }
  const app=Object.assign(new Koa(),
    {
      emailClient,
      sendCodeEmail,
      start(callback?: (port?:number|string) => void) {
        if(!hasController){
          logger.error("Services Not For Ready. Call `applyServices` First")
          return 
        }
        const { port } = config;
        app.listen(port, ()=>(callback||onStartApp)(port));
        return app;
      },
      async loggerMiddleware(ctx: Koa.Context, next: Koa.Next) {
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
          ctx.body = {
            error:msg,
            message:error.message||'',
          }
          new Logger().log(logLevel, `${msg} :${error.message}`);
        }
      },
      async replyMiddleware(ctx: Koa.Context, next: Koa.Next){
        const reply:Reply=(body)=>{
          ctx.body={data:body}
        }
        ctx.reply=reply
        await next()
      },
      async requireCheckMiddleware(ctx: Koa.Context, next: Koa.Next){
        const requireCheck:RequireCheck=(params)=>{
          Object.keys(params).forEach(key=>{
            const value=params[key]
            // not null undefinded
            if(R.isNil(value)){
              throw new Error(`${key} is require`)
            }
            // not '' [] {}  (0 is okey)
            if(R.isEmpty(value)){
              throw new Error(`${key} is require`)
            }
          })
        }
        ctx.requireCheck=requireCheck
        await next()
      },
      applyEmail(){
       
       
        app.use(async(ctx,next)=>{
          ctx.emailClient=emailClient;
          ctx.sendCodeEmail=sendCodeEmail;
          await next()
        });
      },
      applyMiddleware() {
        app.use(helmet());
        app.use(bodyParser());
        // ctx.reply format
        app.use(app.replyMiddleware)
        // errorcatch and logger 
        app.use(app.loggerMiddleware);
        // RequireCheck
        app.use(app.requireCheckMiddleware)
        return app;
      },
      applyController(enforceController:(app: any) => any) {
        hasController=true
        enforceController(app)
        return app;
      },
      startTasksJob(callback?: CronCommand) {
        new CronJob({
          onTick: callback||onStartTasksJob,
          cronTime: config.cronJobExpression,
          runOnInit: true,
        });
        return app;
      }
    })
  return app
}

export default createApp
export type Application=ReturnType<typeof createApp>
export const onStartApp=(port:string|number)=>{
  new Logger().info(`App Started On Port ${port}`);
}
export const onStartTasksJob=()=>{
  new Logger().info("TasksJobs Started!");
}