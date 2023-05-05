import { Context } from "koa";

import {
  request,
  summary,
  path,
  body,
  responsesAll,
  tagsAll,
  description,
} from "koa-swagger-decorator";

@responsesAll({
  200: { description: "success" },
  400: { description: "bad request" },
  401: { description: "unauthorized, missing/wrong jwt token" },
})
@tagsAll(["用户管理"])
export default class UserController {
  @request("get", "/users")
  @summary("Find all users")
  public static async getUsers(ctx: Context): Promise<void> {
    // return OK status code and loaded users array
    ctx.status = 200;
    ctx.body = {};
  }

  @request("post", "/users")
  @summary("Create a user")
  @body({ name: 123 })
  public static async createUser(ctx: Context): Promise<void> {}
}
