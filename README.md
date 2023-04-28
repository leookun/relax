> something are not ready,destructive changes are possible 
#### Relax is an opinionated koa application.

Minimal chained api

```ts
import "@/controller/users"
import Application from "@leokun/koa-application";
import {enforceController} from "@leokun/koa-controller";
import services from '@leokun/koa-services'
import config from "@/config";

new Application(config)
  .applyServices(services)
  .applyController(enforceController)
  .startTasksJob(Application.onStartTasksJob)
  .start(Application.onStartApp)

```

Compose Controller

```ts
import { createController, get, post, controller, prefix } from "@leokun/koa-controller";
import * as User from "@/services/User"

createController(
  prefix("/users"),
  get("/index"),
  controller(async (ctx) => {
    ctx.body = await User.getUsers()
  })
);

createController(
  prefix("/users"),
  post("/register"),
  controller(async (ctx) => {
    const {email,password}=ctx.request.body as {email:string,password:string}
    ctx.body = (await User.register(email,password))
  })
);

```

Prisma as Services

```ts
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
  return await services.user.findMany()
}
```
