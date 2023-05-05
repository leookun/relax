import Router from 'koa-router';
import compose from 'koa-compose';
import {SendCodeEmail,RequireCheck,Reply,Application} from '@leokun/koa-application';
import { Logger } from "@leokun/koa-application/src/common/logger";
import { Middleware, DefaultState, DefaultContext } from 'koa';
export type Setter<T = any> = (state: T) => T;
export type State<T = unknown> = [T, (setter: Setter<T>) => T];
export type ControllerEnhanceParam = {
  swaggerState: State<{}>;
  methodState: State<string>;
  pathState: State<string>;
  prefixState: State<string>;
  next: Middleware;
};

export type ControllerEnhance = <
  StateT = DefaultState,
  ContextT = DefaultContext,
  ResponseBodyT = any
>(
  param: ControllerEnhanceParam
) => Middleware;
export type Controller = (
  ...controllerEnhance: ControllerEnhance[]
) => Router<{}>;

const Routers:Router[]=[]

export const enforceController=(app:Application)=>{
  Routers.forEach((routers)=>{
    app.use(routers.routes())
  })
  return app
}

export const createController: Controller = (...controllerEnhances) => {
  


  type Method = 'post' | 'get';
  let path = '/',
    method: Method = 'get',
    swagger = {},
    prefix = '';

  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  const err = new Error;
  const stack = err.stack as unknown as any[];
  Error.prepareStackTrace = orig;
  const stackFolderName:string=stack[1]?.getFileName?.()||''
  if(stackFolderName){

    const [_,firstLeavel,secondLevel]:string[]=stackFolderName.match(
      /* eslint-disable-next-line no-useless-escape */
      /\/([^/]+)\/([^/\.]+)\.\w+$/
    )||[]
    if(firstLeavel&&secondLevel){
      prefix=`/${firstLeavel}${secondLevel==='index'?'':'/'+secondLevel}`
    }
  } 
  const pathState: State<typeof path> = [
    path,
    (setter) => {
      path = setter(path);
      return path;
    },
  ];
  const prefixState: State<typeof prefix> = [
    prefix,
    (setter) => {
      prefix = setter(prefix);
      return prefix;
    },
  ];
  const swaggerState: State<typeof swagger> = [
    swagger,
    (setter) => {
      swagger = setter(swagger);
      return swagger;
    },
  ];
  const methodState: State<Method> = [
    method,
    (setter) => {
      method = setter(method);
      return method;
    },
  ];

  const middlewares = controllerEnhances.map((controllerEnhance) =>
    controllerEnhance({
      swaggerState,
      methodState,
      pathState,
      prefixState,
      async next(_, next) {
        await next();
      },
    })
  );
  const middleware = compose(middlewares);
  const router = new Router({prefix: prefix || '',});
  router[method](path, middleware);
  Routers.push(router)
  return router;
};

export const post =
  (path: string): ControllerEnhance =>
    ({ pathState, methodState, next }) => {
      const [, pathSetter] = pathState;
      const [, methodSetter] = methodState;
      pathSetter(() => path);
      methodSetter(() => 'post');
      return next;
    };

export const get =
  (path: string): ControllerEnhance =>
    ({ pathState, methodState, next }) => {
      const [, pathSetter] = pathState;
      const [, methodSetter] = methodState;
      pathSetter(() => path);
      methodSetter(() => 'get');
      return next;
    };
export const prefix =
  (prefix?: string): ControllerEnhance =>
    ({ prefixState, next }) => {
      const [, prefixSetter] = prefixState;
      prefixSetter(() => prefix || '');
      return next;
    };


export const controller =<
RquestBodyT={},
ResponseBodyT = any,
ContextT = DefaultContext&{
  request:{body:Partial<RquestBodyT>},
  logger: InstanceType<typeof Logger>;
  sendCodeEmail: SendCodeEmail;
  requireCheck: RequireCheck;
  reply: Reply;
},
StateT = DefaultState
>
  (middleware: Middleware<StateT,ContextT,ResponseBodyT>): ControllerEnhance =>
    () => {
      return middleware;
    };
