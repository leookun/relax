import {
  createController,
  get,
  post,
  controller,
  prefix,
} from "@leokun/koa-controller";
import * as User from "@/services/User"

createController(
  prefix("/users"),
  get("/list"),
  controller(async (ctx) => {
    ctx.body = await User.getUsers()
  })
);

createController(
  prefix("/users"),
  post("/register"),
  controller<{email:string,password:string}>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.body = (await User.register(email,password))
  })
);
