import {
  create,
  get,
  post,
  controller,
} from "@leokun/koa-controller";
import * as User from "@/services/User"

create(
  get("/list"),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);

create(
  post("/register"),
  controller<{email:string,password:string,okk:string}>(async (ctx) => {
    const {email,password,okk}=ctx.request.body;
    await ctx.requireCheck({email,password,okk})
    ctx.logger.info(`🎉 New User Registed: ${email}`)
    ctx.reply(await User.register(email,password))
    ctx.sendCodeEmail("envov@foxmail.com",{
      userName:ctx.body,
      code:`123456`,
    })
  })
);
