import { createController, get, controller } from "@leokun/relax";
import * as User from "@/services/User"

createController(
  get(),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);
