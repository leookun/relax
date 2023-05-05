import { createController, controller } from "@leokun/relax";

createController(
  controller(async (ctx)=>{
    ctx.error("something error")
  })
)