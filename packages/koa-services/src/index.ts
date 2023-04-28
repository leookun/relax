
import { PrismaClient } from '@prisma/client'
export type Prisma=InstanceType<typeof PrismaClient>
export type Service=<T extends Record<any,any>,>(prisma:Prisma)=>T
export class Services extends PrismaClient{
  constructor(){
    super()
  }
}
export default new Services()