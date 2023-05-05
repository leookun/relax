import { createController, get, post, controller,ContextT} from "@leokun/relax";
import * as User from "@/services/User"
import dayjs from "dayjs"

export type Register={email:string,code:string,password:string}

type GetCodeByEmailParams={email:string}

createController(
  post(),
  controller<GetCodeByEmailParams>(async (ctx,next) => {
    const {email}=ctx.request.body;
    ctx.requireCheck({email})
    const isUserExist=await User.isUserExist(email)
    if(isUserExist){
      ctx.error('用户已存在，请勿重新注册')
      return
    }
    const cache=await ctx.redis.get(email)
    if(cache){
      const { createAt,code }=JSON.parse(cache)
      const passTime= dayjs().diff(dayjs(createAt),'second')
      if(passTime<60){
        ctx.logger.warn(`用户 ${email} 在 ${passTime}秒 内重复获取邮箱验证码 [${code}]`)
        ctx.error(`请勿重复获取，${60-passTime}秒后重试`)
        return
      }
    }
    resendRegisterEmail(ctx,email)
    ctx.reply(email)
  })
);

export async function resendRegisterEmail(ctx:ContextT,email:string){
  const code=User.genNum();
  ctx.logger.info(`New User is Preparing For Registration: ${email} [${code}]`)
  await ctx.redis.set(email,JSON.stringify({code, createAt:dayjs().toString()}), {EX:60*30} )
  await ctx.sendCodeEmail(email,{
    userName:email,
    code
  })
}