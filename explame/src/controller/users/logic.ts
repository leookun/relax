
import { createController, post, controller } from "@leokun/relax";
export type Logic={email:string,password:string}
createController(
  post(),
  controller<Logic>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.requireCheck({email,password})
  })
)
