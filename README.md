> something are not ready,destructive changes are possible 
#### Relax is an opinionated koa application.

CreateApp

```ts

import "@/controller/users/index"
import createApp from "@leokun/koa-application";
import config from "@/config"
import { enforceController } from "@leokun/koa-controller";

createApp(config)
  .applyController(enforceController)
  .startTasksJob()
  .start()

```

Compose Controller

```ts
import { createController, get, post, controller, } from "@leokun/koa-controller";
import * as User from "@/services/User"

createController(
  get("/list"),
  controller(async (ctx) => {
    ctx.reply(await User.getUsers())
  })
);

createController(
  post("/register"),
  controller<{email:string,password:string}>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.requireCheck({email,password})
    ctx.logger.info(`🎉 New User Registed: ${email}`)
    ctx.reply(await User.register(email,password))
    ctx.sendCodeEmail("xxx@gmial.com",{
      userName:ctx.body,
      code:`123456`,
    })
  })
);


```

Atom Services

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
