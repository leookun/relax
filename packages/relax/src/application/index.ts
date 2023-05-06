import Koa from "koa";
import nodemailer from "nodemailer";
import { createClient } from "redis";
import { enforceController } from "../controller";
import jwt from "koa-jwt";

import { resolve } from 'path';
import { globSync } from 'glob';
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import { Logger, LoggerLevel } from "./common/logger";
import { Config } from "./common/config";
import { CronJob, CronCommand } from "cron";
import * as R from "ramda"
import CODE_EMAIL_TEMPLATE from "./common/verification-code"
export * from "./common/config";
export * from "./common/logger";
export type SendCodeEmail = (to: string, body: { code: string, userName: string }) => Promise<true>
export type RequireCheck = (params: Record<string, unknown>) => void
export type Reply = <T, >(params?: T) => void
export type ErrorReply = <T, >(msg: T) => void
export type Redis = ReturnType<typeof createClient>
export const createApp = (config: Config) => {
  let hasController = false;
  let hasDefaultMiddlewares = false
  const logger = new Logger();
  const redis: Redis = createClient({ url: config.redis })
  const emailClient = nodemailer.createTransport({
    host: config.email?.host || '',
    service: config.email.service || '',
    auth: config.email
  });
  const sendCodeEmail: SendCodeEmail = async (to, body) => {
    return new Promise((resolve, reject) => {
      emailClient.sendMail({
        from: `邮箱验证消息 <${config.email.user}>`,
        to,
        subject: "你正在邮箱验证",
        html: CODE_EMAIL_TEMPLATE.replace("{{USER_NAME}}", body.userName)
          .replace("{{CODE}}", body.code)
      }, function (error, info) {
        if (error) {
          logger.error(`Email Unable To ${to} :[${body.userName},${body.code}]`)
          reject(error)
        } else {
          logger.info(`Email Sended To ${to} :[${body.userName},${body.code}]`)
          resolve(true)
        }
      });
    })
  }
  const app = Object.assign(new Koa(),
    {
      emailClient,
      sendCodeEmail,
      async start(callback?: (port?: number | string) => void) {
        app.applyController(enforceController)
        if (!hasController) {
          logger.error("Services Not For Ready. Call `applyServices` First")
          return
        }
        try {
          await redis.connect();
          logger.info("Redis Connected Success!")
        } catch (error) {
          logger.error(`Redis Connected Fail: ${error}`)
          process.exit(-1)
        }

        const { port } = config;
        app.listen(port, () => (callback || onStartApp)(port));
        return app;
      },
      async loggerMiddleware(ctx: Koa.Context, next: Koa.Next) {
        const start = new Date().getTime();
        try {
          ctx.logger = logger
          await next();
        } catch (error) {
          ctx.status = error.status || 500;
          const ms = new Date().getTime() - start;
          let logLevel: LoggerLevel = "error";
          if (ctx.status >= 500) {
            logLevel = "error";
          } else if (ctx.status >= 400) {
            logLevel = "warn";
          } else {
            logLevel = "info";
          }
          const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
          ctx.body = { error: msg }
          new Logger().log(logLevel, `${msg} 响应信息:${error.message}`);
        }
      },
      async replyMiddleware(ctx: Koa.Context, next: Koa.Next) {
        const start = new Date().getTime();
        const reply: Reply = (body) => {
          ctx.body = { data: body || null }
        }
        const error: ErrorReply = (msg) => {
          ctx.status = 500
          const ms = new Date().getTime() - start;
          const error = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
          ctx.body = { error, msg }
        }
        ctx.reply = reply
        ctx.error = error
        await next()
      },
      async requireCheckMiddleware(ctx: Koa.Context, next: Koa.Next) {
        const requireCheck: RequireCheck = (params) => {
          Object.keys(params).forEach(key => {
            const value = params[key]
            // not null undefinded
            if (R.isNil(value)) {
              throw new Error(`${key} is require`)
            }
            // not '' [] {}  (0 is okey)
            if (R.isEmpty(value)) {
              throw new Error(`${key} is require`)
            }
          })
        }
        ctx.requireCheck = requireCheck
        await next()
      },
      async redisMiddleware(ctx: Koa.Context, next: Koa.Next) {
        ctx.redis = redis
        await next()
      },
      async emailMiddleware(ctx: Koa.Context, next: Koa.Next) {
        ctx.emailClient = emailClient;
        ctx.sendCodeEmail = sendCodeEmail;
        await next()
      },
      applyMiddleware() {
        if (!hasDefaultMiddlewares) {
          app.use(helmet());
          app.use(bodyParser());
          // ctx.reply format
          app.use(app.replyMiddleware)
          // errorcatch and logger 
          app.use(app.loggerMiddleware);
          // RequireCheck
          app.use(app.requireCheckMiddleware)
          app.use(app.redisMiddleware)
          app.use(app.emailMiddleware)
          hasDefaultMiddlewares = true
        }
        return app;
      },
      applyController(enforceController: (app: any) => any) {
        app.applyMiddleware()
        hasController = true
        const controllerPaths = globSync([
          resolve(process.cwd(), "./src/controller", "./**/*.ts"),
          resolve(process.cwd(), "./src/controller", "./**/*.js"),

          resolve(process.cwd(), "./controller", "./**/*.js"),
          "!" + resolve(process.cwd(), "./controller", "./**/*.js"),

          resolve(process.cwd(), "./controller", "./**/*.ts"),
          "!" + resolve(process.cwd(), "./controller", "./**/*.ts"),

          "!" + resolve(process.cwd(), "./src/controller", "./**/*.js"),
          "!" + resolve(process.cwd(), "./src/controller", "./**/*.ts")
        ])
        Promise.all(controllerPaths.map(async path => {
          await import(path)
        })).then((controllers) => {
          enforceController(app)
        })
        return app;
      },
      startTasksJob(callback?: CronCommand) {
        new CronJob({
          onTick: callback || onStartTasksJob,
          cronTime: config.cronJobExpression,
          runOnInit: true,
        });
        return app;
      }
    })
  return app
}

export type Application = ReturnType<typeof createApp>
export const onStartApp = (port: string | number) => {
  new Logger().info(`App Started Success On Port ${port}!`);
}
export const onStartTasksJob = () => {
  new Logger().info("Tasksjobs Started Success!");
}
