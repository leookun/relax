import Application from "@/App";
import config from "@/config";
new Application(config)
  .start(Application.onStartApp)
  .startTasksJob(Application.onStartTasksJob);
