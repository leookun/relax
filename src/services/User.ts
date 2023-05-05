import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('123456789QWERTYUPASDFGHJKZXCVBNM', 10);
import services from '@leokun/koa-services'

export  async function register(email: string, password: string) {
  return (await services.user.create({
    data: {
      email,
      password,
      userName: nanoid(),
      head: '',
    },
  }))?.userName
}

export async function getUsers() {
  return (await services.user.findMany({select:{userName:true}})).map(v=>v.userName)
}