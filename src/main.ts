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
