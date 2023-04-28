Opinionated koa application

### Minimal chained necessary api

```ts
import Application from "@leokun/koa-application";
import userController from "@/controller/user/index";
import config from "@/config";

new Application(config)
  .start(Application.onStartApp)
  .startTasksJob(Application.onStartTasksJob)
  .applyController(userController);
```

### Compose Controller

```ts
import {
  createController,
  get,
  controller,
  prefix,
} from "@leokun/koa-controller";

export default createController(
  get("/index"),
  prefix("/user"),
  controller(async (ctx, app, services, next) => {
    ctx.body = "hello word";
  })
);
```

### Prisma Services

```ts
export default (prisma: InstanceType<typeof PrismaClient>) => {
  return {
    async register(email: string, password: string) {
      return await prisma.user.create({
        data: {
          email,
          password,
          userName: nanoid(),
          head: "",
        },
      });
    },
  };
};
```

All Implementation is all in packages/
