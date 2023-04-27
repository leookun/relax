import Application from '@/App';
import config from '@/config';
import userController from '@/controller/user/index';

new Application(config).start(Application.onStartApp).startTasksJob(Application.onStartTasksJob).applyController(userController);
