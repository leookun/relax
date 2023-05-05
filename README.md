#### Relax is an opinionated koa application.

CreateApp with [Config]("./packages/koa-application/src/common/config.ts")

The application automatically has the following functions
- Logger Context (Good-looking and easy to use)
- Email Context (Some templates are built in)
- Redis Context
- Formated Response(or Error Response) Context
- Required Params Check Context
- BodyParser And Helmet Context

```ts
import createApp from "@leokun/koa-application";
import config from "@/config"
createApp(config).start()

```

Compose Controller

Make sure your controller file location under the src/controller, such as ` controller/users/login.ts `, routing address will automatically be registered for `/users/login`

You can override the route path using helper functions provided by the controller. The `prefix`, `get`, and `post` functions can be used in combination

The controller function accepts a middleware, and ctx is already a fully typed object.

```ts
import { createController, get, post, controller,prefix } from "@leokun/koa-controller";
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
