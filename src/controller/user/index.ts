import { createController,get,controller,prefix} from "@leokun/koa-controller";
export default createController(
    get("/index"),
    prefix("/user"),
    controller(
        async (ctx)=>{
          ctx.body="你好吗";
        }
    )
);