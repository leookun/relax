<p align="center">
 <h2 align="center">Relax</h2>
 <p align="center">Relax is an opinionated nodejs server application </p>
</p>
  <!-- <p align="center">
    <a href="https://github.com/leookun/relax/graphs/contributors">
      <img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/leookun/relax" />
    </a>
    <a href="https://github.com/leookun/relax/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/leookun/relax?color=0088ff" />
    </a>
    <a href="https://github.com/leookun/relax/pulls">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/leookun/relax?color=0088ff" />
    </a>
    <br />
    <br />
  </p> -->

  <p align="center">
    <a href="/explame">View Explame</a>
    ·
    <a href="https://github.com/leookun/relax/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/leookun/relax/issues/new/choose">Request Feature</a>
  </p>
  
</p>

# Features
The application automatically has the following functions
* Logger context (good-looking and easy to use)
* Email context (some templates are built in)
* Redis context
* Formated response(or Error Response) context
* Required rarams check context
* BodyParser and helmet context


# Usage
## 1.Install

```sh
npm install @leokun/relax
// or
yarn add @leokun/relax
// or
pnpm install @leokun/relax
```
## 2. CreateApp in your main.ts
```ts
import {createApp} from "@leokun/relax";
import config from "@/config"
createApp(config).start()


```
## 3. Create compose controllers 

Make sure your controller file location under the src/controller, such as ` controller/users/login.ts `, routing address will automatically be registered for `/users/login`

You can override the route path using helper functions provided by the controller. The `prefix`, `get`, and `post` functions can be used in combination

The controller function accepts a middleware, and ctx is already a fully typed object.

explame( POST /users/logic ):


```ts
// src/controller/users/logic

import { createController, post, controller } from "@leokun/relax";
export type Logic={email:string,password:string}
createController(
  post(),
  controller<Logic>(async (ctx) => {
    const {email,password}=ctx.request.body;
    ctx.requireCheck({email,password})
    // ...your code logic
  })
)

```
