import { createController, get, post, controller, } from "@leokun/koa-controller";
import * as User from "@/services/User"
import day from "dayjs"
import dayjs from "dayjs";

createController(
  get("/list"),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);

createController(
  post("/register"),
  controller<{email:string,password:string}>(async (ctx,next) => {
    const {email,password}=ctx.request.body;

    ctx.requireCheck({email,password})

    const old=await ctx.redis.get(email)

    async function resendRegisterEmail(){
    
      const code=User.genNum();
      ctx.logger.info(`New User is Preparing For Registration: ${email} [${code}]`)
      await ctx.redis.set(email,JSON.stringify({
        code,
        createAt:day().toString()
      }),{EX:60*30})
      await ctx.sendCodeEmail(email,{
        userName:email,
        code
      })
    }



    if(old){
      const { createAt,code }=JSON.parse(old)
      const passTime= dayjs().diff(dayjs(createAt),'second')
      if(passTime<60){
        ctx.logger.warn(`用户 ${email} 在 ${passTime}秒 内重复获取邮箱验证码 [${code}]`)
        throw new Error(`请勿重复获取，${60-passTime}秒后重试`)
      }
    }

    resendRegisterEmail()
    ctx.reply(email)
    return


  })
);
