import { createController, get, post, controller, } from "@leokun/koa-controller";
import * as User from "@/services/User"

createController(
  get("/list"),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);

createController(
  post("/register"),
  controller<{email:string,password:string}>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.requireCheck({email,password})
    ctx.logger.info(`🎉 New User Registed: ${email}`)
    ctx.reply(await User.register(email,password))
    ctx.sendCodeEmail("xxx@gmial.com",{
      userName:ctx.body,
      code:`123456`,
    })
  })
);
