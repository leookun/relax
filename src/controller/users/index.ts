import {
  create,
  get,
  post,
  controller,
  prefix,
} from "@leokun/koa-controller";
import * as User from "@/services/User"

create(
  get("/list"),
  controller(async (ctx) => {
    ctx.body = await User.getUsers()
  })
);

create(
  post("/register"),
  controller<{email:string,password:string}>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.logger.info(`🎉 New User Registed: ${email}`)
    ctx.body = (await User.register(email,password))
    ctx.sendCodeEmail("envov@foxmail.com",{
      userName:ctx.body,
      code:`123456`,
    })
  })
);
