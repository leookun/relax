import { createController, controller } from "@leokun/koa-controller";

createController(
  controller(async (ctx)=>{
    ctx.error("something error")
  })
)