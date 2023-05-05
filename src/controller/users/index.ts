import { createController, get, controller } from "@leokun/koa-controller";
import * as User from "@/services/User"

createController(
  get(),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);
