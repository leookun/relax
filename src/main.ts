import Application from "@leokun/koa-application";
import userController from "@/controller/user/index";
import config from "@/config";

new Application(config)
  .start(Application.onStartApp)
  .startTasksJob(Application.onStartTasksJob)
  .applyController(userController);
