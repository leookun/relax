import Router from 'koa-router';
import compose from 'koa-compose';
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
export const createController: Controller = (...controllerEnhances) => {
  type Method = 'post' | 'get';
  let path = '/',
    method: Method = 'get',
    swagger = {},
    prefix = '';
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

export const controller =
  (middleware: Middleware): ControllerEnhance =>
    () => {
      return middleware;
    };