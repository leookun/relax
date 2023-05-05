import "@/controller/users/index"
import createApp from "@leokun/koa-application";
import config from "@/config"
import { enforceController } from "@leokun/koa-controller";

createApp(config)
  .applyController(enforceController)
  .startTasksJob()
  .start()
