# Architecture

## How a request flows

```
Route → Validator (Zod) → Middleware (auth, guards) → Controller → Service (Prisma) → DB
```

A route lists the steps for one URL. Each step is a small class. If a step rejects the request, the rest never run.

## Where things live

```
src/
  index.ts              Entry point
  app/
    app.ts              Express setup, default routes, error handler
    routes/             URL → chain of steps
    validators/         Zod schemas for body, params, query
    middlewares/        Auth and guards
    controllers/        Request handlers
  core/
    base/               Base classes
    utils/              Env, tokens, passwords, cookies
  database/
    services/           One class per DB operation
    system/             Prisma client + BaseService
  generated/prisma/     Generated client (gitignored)
  types/                Shared types
tests/                  Endpoint tests (not part of the build)
```

Every folder has an `index.ts` that creates its classes and exports them as one object. That's why you call things like `Controllers.UserControllers.SignIn` and why adding a feature always ends with "register it in the index".

## Base classes

You extend one of these and implement a single method.

| Class | You implement | You get |
|---|---|---|
| `BaseController` | `module(req, res)` | Call with `.execute()`. Thrown errors become a 500. |
| `BaseMiddleWare` | `middleware(req, res, next)` | `this.z`, `bodyHandler`, `paramHandler`, `queryHandler`. Call with `.run()`. |
| `BaseService` | `transaction(data)` | `this.database` (Prisma). Call with `.call()`. Thrown errors become `null`. |

All of them extend `Base`, which gives `this.Utils`, `this.Service`, `this.HTTP_STATUS`, `this.HTTP_MSG` and `this.responseHandler()`.

```ts
const user = await this.Service.UserServices.CreateUser.call(data);
const token = this.Utils.Token.signAccess({ payload });
return this.responseHandler(res, this.HTTP_STATUS.SUCCESS, this.HTTP_MSG.SUCCESS, user);
```

Services return `null` on failure instead of throwing, so controllers check `if (!result)` and respond with 400.

## Conventions

- Imports use the `@/` alias and a `.js` extension: `import Base from "@/core/base/base.js"`.
- Prisma fields are camelCase (`userId`) and mapped to snake_case columns with `@map`.
- Prettier: double quotes, semicolons, trailing commas, 80 columns.

## TypeScript configs

- `tsconfig.json` covers `src` and `tests`. Used by the editor, `typecheck` and ESLint.
- `tsconfig.build.json` covers `src` only. Used by `pnpm build`, so tests never reach `dist/`.