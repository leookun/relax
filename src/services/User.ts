import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('123456789QWERTYUPASDFGHJKZXCVBNM', 10);
import services from "@/services"

export  async function register(email: string, password: string) {
  const registedUser=await services.user.findFirst({where:{email}})
  if(registedUser){
    return false
  }
  return  !!await services.user.create({
    data: {
      email,
      password,
      userName: nanoid(),
      head: '',
    },
  })
}
export  async function isUserExist(email: string) {
  const registedUser=await services.user.findFirst({where:{email}})
  return !!registedUser
}

export async function getUsers() {
  return (await services.user.findMany({select:{userName:true}})).map(v=>v.userName)
}
export function genNum(length=6){
  return customAlphabet('0123456789', length)()
}