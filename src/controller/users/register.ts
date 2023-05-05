import { createController, get, post, controller } from "@leokun/koa-controller";
import * as User from "@/services/User"
export type Register={email:string,code:string,password:string}

createController(
  post(),
  controller<Register>(async (ctx) => {
    const {email,code,password}=ctx.request.body;
    ctx.requireCheck({email,code,password})
    const cache=await ctx.redis.get(email)
    if(!cache){
      ctx.error('请先发送验证码')
      return
    }
    const cacheJSON=JSON.parse(cache)
    if(cacheJSON?.code===code){
      if(await User.register(email,password)){
        await ctx.redis.del(email)
        ctx.reply("注册成功")
        return
      }
      ctx.error('注册失败，邮箱已被使用')
      return 
    } 
    ctx.error('验证码错误')
    return
  })
)